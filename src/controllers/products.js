const knex = require('../database/connection');

const show = async (req, res) => {
	const products = await knex('products').select('*');

	return res.json(products);
};

const getPriceHandler = async (req, res) => {
	const { id } = req.params;

	const priceHandler = await knex('products')
		.select('priceHandler')
		.where('id', id)
		.first();

	if (!priceHandler) {
		return res.status(400).json({ error: 'product not found' });
	}

	return res.json(priceHandler);
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

			const ids = await trx('products').insert(product);
			const product_id = ids[0];
			console.log(ids);

			return res.json({ product: product_id });
		} catch (err) {
			return res.json({ error: err });
		}
	});
};

module.exports = {
	add,
	show,
	getPriceHandler,
};
