const knex = require('../database/connection');

knex.transaction(function (trx) {
	return Promise.all([
		knex('price_record').orderBy('createdAt', 'desc').select('*'),
		knex('foo').insert({ name: 'My Name' }).transacting(trx),
		knex('bar').insert({ field: 'Value' }).transacting(trx),
	]);
});
