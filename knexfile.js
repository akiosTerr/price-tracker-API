const path = require('path');

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

module.exports = {
	client: 'pg',
	connection: {
		host: process.env.PG_HOST,
		user: process.env.PG_USER,
		password: process.env.PG_PASSWORD,
		database: process.env.PG_USER,
	},
	migrations: {
		directory: path.resolve(__dirname, 'src', 'database', 'migrations'),
	},
	seeds: {
		directory: path.resolve(__dirname, 'src', 'database', 'seeds'),
	},
	useNullAsDefault: true,
};
