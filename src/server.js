const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.get('/', (req, res) => {
	res.json({ hello: 'world' });
});

app.listen(port, () => {
	console.log(`listining on port:${port}`);
});
