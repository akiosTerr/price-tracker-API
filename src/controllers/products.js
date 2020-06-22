const knex = require('../database/connection');
const ClapScrap = require('../lib/ClapScrap');

const CS = new ClapScrap(require('../data/UA.json').userAgent);

const index = async (req, res) => {
	const products = await knex('products').select('*');

	return res.json(products);
};

const show = async (req, res) => {
	const { id } = req.params;

	//get last two price tags
	const data = await knex('price_record')
		.where('product_id', id)
		.orderBy('createdAt', 'desc')
		.limit(2);

	console.log(data);

	if (data.length < 1) {
		return res.status(400).json({ error: 'product not found' });
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

	if (!currentPrice) {
		return res.json({ error: 'element not found' });
	}

	const price_record_item = await trx('price_record')
		.where('product_id', id)
		.orderBy('createdAt', 'desc')
		.first()
		.select('price');

	if (!price_record_item) {
		console.log('empty price list, posting first price...');
		const new_price = { product_id: id, price: currentPrice };
		console.log(new_price);
		await trx('price_record').insert(new_price);
		trx.commit();
		return res.json(new_price);
	}

	const lastPrice = price_record_item.price;

	if (lastPrice !== currentPrice) {
		console.log('price is different, posting new price...');
		const new_price = { product_id: id, price: currentPrice };
		console.log(new_price);
		await trx('price_record').insert(new_price);
		trx.commit();
		return res.json({ newPrice: new_price.price });
	}
	console.log({ lastPrice, price: currentPrice });
	return res.json({ currentPrice, lastPrice });
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
			return res.json({ error });
		}
	});
};

module.exports = {
	add,
	show,
	index,
	getprice,
};
