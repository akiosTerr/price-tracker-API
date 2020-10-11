const express = require('express');
const path = require('path');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());
app.use('/api', routes);
app.use(
	express.static(path.join(__dirname, '..', '..', 'price-tracker', 'build'))
);

app.listen(port, () => {
	console.log(`listening on port:${port}`);
});
