const router = require('express').Router();
const productsController = require('./controllers/products');
const usersController = require('./controllers/users');
// const knex = require('./database/connection');

router.get('/products/test', productsController.test);
router.get('/products', productsController.index);
router.get('/products/:id', productsController.show);
router.get('/products/:id/getPrice', productsController.getprice);
router.post('/products', productsController.add);

router.post('/users', usersController.add);
router.post('/users/auth', usersController.login);

module.exports = router;
