// const { Router } = require('express');
// const ctrl = require('../controllers/autenticaciones.controller');
// const { requireAuth } = require('../middlewares/auth.js');

import { Router } from 'express';
import * as ctrl from '../controllers/autenticaciones.controller.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

// Administrador
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', requireAuth, ctrl.me);

// Google OAuth (GET: son navegaciones del navegador, no llamadas fetch)
router.get('/google/login', ctrl.googleLogin);
router.get('/google/callback', ctrl.googleCallback);

export default router;