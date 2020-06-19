async function up(knex) {
	return knex.schema.createTable('priceCharts', (table) => {
		table.increments('id').primary();
		table
			.integer('product_id')
			.notNullable()
			.references('id')
			.inTable('products');
		table.string('price').notNullable();
		table.date('date').notNullable();
	});
}

async function down(knex) {
	return knex.schema.dropTable('priceCharts');
}

module.exports = {
	up,
	down,
};
