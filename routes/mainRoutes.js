const express = require('express');

const controller = require('../controllers/mainController');

const router = express.Router();

router.get('/', controller.index);

router.get('/contact', controller.contact);

router.get('/about', controller.about);

router.get('/copyright', controller.copyright);

module.exports = router;