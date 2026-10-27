// const { Router } = require('express');
// const ctrl = require('../controllers/autenticaciones.controller');
// const { requireAuth } = require('../middlewares/auth.js');

import { Router } from 'express';
import * as ctrl from '../controllers/autenticaciones.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', requireAuth, ctrl.me);

export default router;