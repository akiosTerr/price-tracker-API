const router = require('express').Router();
const productsController = require('./controllers/products');
// const knex = require('./database/connection');

router.get('/products', productsController.index);
router.get('/products/:id', productsController.show);
router.get('/products/:id/getPrice', productsController.getprice);
router.post('/products', productsController.add);

module.exports = router;
