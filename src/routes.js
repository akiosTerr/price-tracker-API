const router = require('express').Router();
const productsController = require('./controllers/products');
// const knex = require('./database/connection');

router.get('/products', productsController.show);
router.get('/products/:id', productsController.getPriceHandler);
router.post('/products', productsController.add);

module.exports = router;
