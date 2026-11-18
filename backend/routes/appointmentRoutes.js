const express = require('express');
const { bookAppointment, getAppointments, cancelAppointment, acceptAppointment } = require('../controllers/appointmentController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware); // All routes require authentication

router.post('/book', roleMiddleware(['patient']), bookAppointment);
router.get('/', getAppointments);
router.delete('/cancel/:id', cancelAppointment);
router.put('/accept/:id', roleMiddleware(['doctor']), acceptAppointment);

module.exports = router;
