const { Router } = require('express');
const ctrl = require('../controllers/auxiliares.controller');

const router = Router();

router.get('/roles', ctrl.roles);
router.get('/estados', ctrl.estados);
router.get('/tipos-roster', ctrl.tiposRoster);
router.get('/health', ctrl.health);

module.exports = router;