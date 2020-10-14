async function up(knex) {
	return knex.schema.createTable('price_store', (table) => {
		table.increments('id').primary();
		table
			.integer('product_id')
			.unsigned()
			.references('products.id')
			.onUpdate('CASCADE')
			.onDelete('CASCADE')
			.notNullable();
		table.string('price').notNullable();
		table.timestamp('createdAt').defaultTo(knex.fn.now());
	});
}

async function down(knex) {
	return knex.schema.dropTable('price_store');
}

module.exports = {
	up,
	down,
};
