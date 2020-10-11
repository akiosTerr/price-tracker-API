const knex = require('../database/connection');
const ClapScrap = require('../lib/ClapScrap');

const CS = new ClapScrap(require('../lib/UA.json').userAgent);

const test = async (req, res) => {
	console.log('test query');
	const products = await knex('price_record')
		.innerJoin('products', 'price_record.product_id', '=', 'products.id')
		.select('product_id', 'price', 'title', 'link');

	return res.json(products);
};

const index = async (req, res) => {
	const products = await knex('products').select(
		'id',
		'title',
		'link',
		'imageURL'
	);
	const pricetags = await knex('price_record')
		.orderBy('createdAt', 'desc')
		.select('*');

	console.log('products query');

	// probably not a good way to do this
	// maybe I can do this better with SQL QUERY
	// using join or something
	const serializedItems = products.map((product) => {
		const raw_pricetags = pricetags.filter((price) => {
			return price.product_id === product.id;
		});
		const [current, previous] = raw_pricetags;

		if (current !== undefined) product.current_pricetag = current.price;
		if (previous !== undefined) product.previous_pricetag = previous.price;

		return product;
	});

	return res.json(serializedItems);
};

// todo: external API call to fetch text from query params

const show = async (req, res) => {
	const { id } = req.params;

	//get last two price tags
	const data = await knex('price_record')
		.where('product_id', id)
		.orderBy('createdAt', 'desc')
		.limit(2)
		.select('price');

	if (data.length < 1) {
		return res.status(400).json({ error: 'product has no price tags' });
	}

	return res.json(data);
};

const getprice = async (req, res) => {
	const { id } = req.params;

	const trx = await knex.transaction();

	const data = await trx('products')
		.select('priceHandler', 'link')
		.where('id', id)
		.first();

	if (!data) {
		return res.status(400).json({ error: 'product not found' });
	}

	const { page, response } = await CS.launchBot(data.link);
	const status = response.headers().status;

	if (status !== '200') {
		return res.json({ 'http request error': status });
	}

	const currentPrice = await CS.getText(page, data.priceHandler);

	// CS.getText(page, data.priceHandler)
	// 	.then((data) => {
	// 		console.log(data);
	// 		currentPrice = data;
	// 	})
	// 	.catch((err) => {
	// 		console.log(err);
	// 		return res.json({ err });
	// 	});

	//todo: build a better error logger

	if (currentPrice.status === 0) {
		return res.json({ error: currentPrice.payload });
	}

	const priceRecord = await trx('price_record')
		.where('product_id', id)
		.orderBy('createdAt', 'desc')
		.limit(2)
		.select('price', 'id');

	if (priceRecord.length < 1) {
		console.log('empty price list, posting first price...');
		const new_price = { product_id: id, price: currentPrice.payload };
		await trx('price_record').insert(new_price);
		trx.commit();
		console.log('==end==');
		return res.json({ priceChange: true, newPrice: currentPrice.payload });
	}

	const [lastPrice, previousPrice] = priceRecord;

	if (lastPrice.price !== currentPrice.payload) {
		console.log('price is different, posting new price...');
		const new_price = { product_id: id, price: currentPrice.payload };
		await trx('price_record').insert(new_price);
		trx.commit();
		console.log('==end==');
		return res.json({
			priceChange: true,
			newPrice: currentPrice.payload,
			lastPrice: lastPrice.price,
		});
	}

	console.log('(no price changes)');
	return res.json({
		priceChange: false,
		currentPrice: lastPrice,
		previousPrice,
	});
};

const add = async (req, res) => {
	const { title, link, imageURL, priceHandler } = req.body;

	knex.transaction(async (trx) => {
		try {
			const product = {
				title,
				link,
				imageURL,
				priceHandler,
			};

			const ids = await trx('products').returning('id').insert(product);
			const product_id = ids[0];
			console.log({ product_id });

			return res.json({ product: product_id });
		} catch (error) {
			console.error(error);
			return res.json({ error });
		}
	});
};

module.exports = {
	add,
	show,
	index,
	getprice,
	test,
};
