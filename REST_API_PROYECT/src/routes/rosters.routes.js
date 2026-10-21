const { Router } = require('express');
const ctrl = require('../controllers/rosters.controller');
const asignaciones = require('../controllers/asignaciones.controller');
const { protegerEscritura } = require('../middlewares/auth');

const router = Router();

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', protegerEscritura, ctrl.crear);
router.put('/:id', protegerEscritura, ctrl.actualizar);
router.delete('/:id', protegerEscritura, ctrl.eliminar);
router.get('/:id/jugadores', asignaciones.listar);
router.post('/:id/jugadores', protegerEscritura, asignaciones.asignar);
router.put('/:id/jugadores/:id_jugador', protegerEscritura, asignaciones.cambiarRol);
router.delete('/:id/jugadores/:id_jugador', protegerEscritura, asignaciones.quitar);

module.exports = router;