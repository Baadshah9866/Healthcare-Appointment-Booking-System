const express = require('express');
const { setAvailability, getDoctors, getDoctorSlots } = require('../controllers/doctorController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id/slots', getDoctorSlots);
router.post('/availability', authMiddleware, roleMiddleware(['doctor']), setAvailability);

module.exports = router;
