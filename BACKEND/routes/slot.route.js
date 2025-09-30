const router = require('express').Router();
const ctrl = require('../controller/slot.controller');

// summary (optional)
router.get('/summary', ctrl.summary);

// delete by human slotId (put BEFORE '/:id')
router.delete('/by-slotId/:slotId', ctrl.removeBySlotId);

// CRUD
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

// real-time ops
router.post('/:id/checkin', ctrl.checkIn);
router.post('/:id/checkout', ctrl.checkOut);
router.post('/:id/maintenance/start', ctrl.maintenanceStart);
router.post('/:id/maintenance/end', ctrl.maintenanceEnd);

// history
router.get('/:id/usage', ctrl.usageBySlot);
router.get('/:id/maintenance', ctrl.maintenanceBySlot);

module.exports = router;
