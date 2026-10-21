const { Router } = require('express');
const ctrl = require('../controllers/jugadores.controller');
const { protegerEscritura } = require('../middlewares/auth');

const router = Router();

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', protegerEscritura, ctrl.crear);
router.put('/:id', protegerEscritura, ctrl.actualizar);
router.delete('/:id', protegerEscritura, ctrl.eliminar);

module.exports = router;