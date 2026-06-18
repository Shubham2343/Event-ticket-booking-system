const express = require('express');
const router = express.Router();
const { createReservation, getMyReservations } = require('../controllers/reservationController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, createReservation);
router.get('/my', authenticate, getMyReservations);

module.exports = router;
