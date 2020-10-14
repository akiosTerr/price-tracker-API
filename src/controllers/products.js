const knex = require('../database/connection');
const ClapScrap = require('../../modules/clapScrap/src/ClapScrap');
const { convertToFloat } = require('../utils/utils');
const {
	table_price_name,
	table_products_name,
} = require('../constants/database');
const CreateResponse = require('../utils/createResponse');
const makeResponse = new CreateResponse();

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
	const pricetags = await knex(table_price_name)
		.orderBy('createdAt', 'desc')
		.select('*');

	// probably not a good way to do this
	// maybe I can do this better with SQL QUERY
	// using join or something
	const serializedItems = products.map((product) => {
		const raw_pricetags = pricetags.filter((price) => {
			return price.product_id === product.id;
		});
		const [current, previous] = raw_pricetags;

		if (current !== undefined) {
			product.current_pricetag = current.price;
			product.createdAt = current.createdAt;
		}
		if (previous !== undefined) product.previous_pricetag = previous.price;

		return product;
	});

	return res.json(serializedItems);
};

// todo: external API call to fetch text from query params

const show = async (req, res) => {
	const { id } = req.params;

	//get last two price tags
	const data = await knex(table_price_name)
		.where('product_id', id)
		.orderBy('createdAt', 'desc')
		.limit(2)
		.select('price');

	if (data.length < 1) {
		const data = { error: 'product has no price tags' };
		return res.status(400).json(makeResponse.response_error(data));
	}

	return res.json(data);
};

const getprice = async (req, res) => {
	const { id } = req.params;

	const trx = await knex.transaction();

	const data = await trx(table_products_name)
		.select('priceHandler', 'link')
		.where('id', id)
		.first();

	if (!data) {
		const errorData = { error: 'product not found' };
		return res.status(400).json(makeResponse.response_error(errorData));
	}

	const { page, response } = await CS.launchBot(data.link);
	const status = response.headers().status;

	if (status !== '200') {
		const errorData = { 'http request error': status };
		return res.json(makeResponse.response_error(errorData));
	}

	const currentPrice = await CS.getText(page, data.priceHandler);

	//todo: build a better error logger
	if (currentPrice.status === 0) {
		const errorMessage = String(currentPrice.payload);
		return res.json(makeResponse.response_error(errorMessage));
	}

	const [formatedPrice] = convertToFloat([currentPrice.payload]);

	const priceRecord = await trx(table_price_name)
		.where('product_id', id)
		.orderBy('createdAt', 'desc')
		.select('price', 'id')
		.first();

	if (priceRecord === undefined) {
		console.log('empty price list, posting first price...');
		const new_price = { product_id: id, price: formatedPrice };
		const [createdAt] = await trx(table_price_name)
			.insert(new_price)
			.returning('createdAt');
		trx.commit();
		return res.json(makeResponse.response_first(formatedPrice, createdAt));
	}

	const lastPrice = Number(priceRecord.price);
	console.log(lastPrice, formatedPrice);
	if (lastPrice !== formatedPrice) {
		console.log('price is different, posting new price...');
		const new_price = { product_id: id, price: formatedPrice };
		const [createdAt] = await trx(table_price_name)
			.insert(new_price)
			.returning('createdAt');
		trx.commit();
		return res.json(
			makeResponse.response_updated(formatedPrice, lastPrice, createdAt)
		);
	}

	console.log('(no price changes)');
	return res.json(makeResponse.response_unchanged());
};

const remove = async (req, res) => {
	const { id } = req.params;

	const products = await knex(table_products_name)
		.where('id', id)
		.del()
		.returning('*');

	return res.json({ status: 'deleted', item: products });
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

			const ids = await trx(table_products_name)
				.returning('id')
				.insert(product);
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
	remove,
	show,
	index,
	getprice,
	test,
};
