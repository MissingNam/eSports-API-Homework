// const { Router } = require('express');
// const ctrl = require('../controllers/jugadores.controller');
// const { protegerEscritura } = require('../middlewares/auth.js');

import { Router } from 'express';
import * as ctrl from '../controllers/jugadores.controller.js';
import { protegerEscritura } from '../middlewares/auth.js';

const router = Router();

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', protegerEscritura, ctrl.crear);
router.put('/:id', protegerEscritura, ctrl.actualizar);
router.delete('/:id', protegerEscritura, ctrl.eliminar);

export default router;