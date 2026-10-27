// const { Router } = require('express');
// const ctrl = require('../controllers/auxiliares.controller');

import { Router } from 'express';
import * as ctrl from '../controllers/auxiliares.controller.js'

const router = Router();

router.get('/roles', ctrl.roles);
router.get('/estados', ctrl.estados);
router.get('/tipos-roster', ctrl.tiposRoster);
router.get('/health', ctrl.health);

export default router;