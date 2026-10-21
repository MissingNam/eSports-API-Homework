const { Router } = require('express');
const ctrl = require('../controllers/autenticaciones.controller');
const { requireAuth } = require('../middlewares/auth');

const router = Router();

router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', requireAuth, ctrl.me);

module.exports = router;