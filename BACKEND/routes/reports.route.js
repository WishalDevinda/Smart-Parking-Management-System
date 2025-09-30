const router = require('express').Router();
const r = require('../controller/reports.controller');
router.get('/usage', r.usage);
router.get('/maintenance', r.maintenance);
module.exports = router;
