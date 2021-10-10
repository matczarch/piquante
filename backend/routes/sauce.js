const express = require('express');
const router = express.Router();

// in routes/sauce.js

const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.get('', auth, sauceCtrl.getAllSauce);
router.get('/:id', auth, sauceCtrl.findOneSauce);
router.post('', auth, multer, sauceCtrl.createSauce);
router.put('/:id', auth, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.evaluateSauce); 


module.exports = router;