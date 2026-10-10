const { Router } = require('express');
const ctrl = require('../controllers/rosters.controller');
const asignaciones = require('../controllers/asignaciones.controller');

const router = Router();

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.post('/', ctrl.crear);
router.put('/:id', ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);
router.get('/:id/jugadores', asignaciones.listar);
router.post('/:id/jugadores', asignaciones.asignar);
router.put('/:id/jugadores/:id_jugador', asignaciones.cambiarRol);
router.delete('/:id/jugadores/:id_jugador', asignaciones.quitar);

module.exports = router;