const knex = require('../database/connection');
const bcrypt = require('bcrypt');

const add = async (req, res) => {
	const name = req.body.name;
	const email = req.body.email;
	const password = await bcrypt.hash(req.body.password, 10);

	const user = {
		name,
		email,
		password,
	};

	knex.transaction(async (trx) => {
		try {
			const ids = await trx('users').returning('id').insert(user);
			const user_id = ids[0];

			console.log(user);
			return res.json({ status: 'success', user: user_id });
		} catch (error) {
			console.log(error);
			return res.json({ error });
		}
	});
};

const login = async (req, res) => {
	const email = req.body.email;
	const ptPassword = req.body.password;
	const user = await knex('users').where('email', email).select('*').first();

	if (user === undefined) {
		return res.json({ error: 'user does not exist' });
	}
	console.log(user);

	bcrypt.compare(ptPassword, user.password, (err, result) => {
		if (err) {
			return res.json({ err });
		}
		if (result) {
			console.log('auth successful');
			return res.json({ access: 'granted' });
		} else {
			console.log('auth failed');
			return res.json({ access: 'denied' });
		}
	});
};

module.exports = {
	add,
	login,
};
