async function up(knex) {
	return knex.schema.createTable('price_record', (table) => {
		table.increments('id').primary();
		table.integer('product_id').notNullable();
		table.string('price').notNullable();
		table.timestamp('createdAt').defaultTo(knex.fn.now());
		table.timestamp('updatedAt');
	});
}

async function down(knex) {
	return knex.schema.dropTable('price_record');
}

module.exports = {
	up,
	down,
};
