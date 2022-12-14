const express = require('express');
const controller = require('../controllers/tradeController');
const {isLoggedIn,  isCreatedBy} = require('../middlewares/auth');
const {validateId,validateTrade,validateResult} = require('../middlewares/validator');

const router = express.Router();

router.get('/', controller.index);

router.get('/new',isLoggedIn, controller.new);

router.post('/', isLoggedIn,validateTrade,validateResult ,controller.create);

router.get('/:id', validateId, controller.show);

router.get('/:id/edit', isLoggedIn, validateId, isCreatedBy, controller.edit);

router.put('/:id',isLoggedIn, validateId, isCreatedBy,validateTrade,validateResult,controller.update);

router.delete('/:id',isLoggedIn, validateId, isCreatedBy, controller.delete);

router.post('/makeoffer', isLoggedIn,controller.makeoffer );

router.post('/:id/acceptoffer', isLoggedIn,controller.accept );

router.post('/:id/canceloffer', isLoggedIn,controller.cancel );
module.exports = router;