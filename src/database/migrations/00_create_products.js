async function up(knex) {
	return knex.schema.createTable('products', (table) => {
		table.increments('id').primary();
		table.string('imageURL').notNullable();
		table.string('title').notNullable();
		table.string('link').notNullable();
		table.string('priceHandler').notNullable();
	});
}

async function down(knex) {
	return knex.schema.dropTable('products');
}

module.exports = {
	up,
	down,
};
