const { query } = require('../config/db');
const { generateSlots } = require('../utils/slotGenerator');

const setAvailability = async (req, res) => {
  try {
    const { availability } = req.body; // e.g. { dayOfWeek: 1, startTime: '10:00', endTime: '17:00', slotDuration: 15 }
    const doctorId = req.user.id;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can set availability' });
    }

    const result = await query(
      'UPDATE doctors SET availability = $1 WHERE user_id = $2 RETURNING *',
      [JSON.stringify(availability), doctorId]
    );

    res.status(200).json({ message: 'Availability updated', doctor: result.rows[0] });
  } catch (error) {
    console.error('Error setting availability:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDoctors = async (req, res) => {
  try {
    const result = await query(`
      SELECT d.id, d.specialization, d.qualification, d.experience, d.availability, u.name, u.email, u.id as user_id
      FROM doctors d
      JOIN users u ON d.user_id = u.id
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDoctorSlots = async (req, res) => {
  try {
    const { id } = req.params; // doctor's user_id
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // 1. Get doctor availability
    const doctorResult = await query('SELECT availability FROM doctors WHERE user_id = $1', [id]);
    if (doctorResult.rows.length === 0 || !doctorResult.rows[0].availability) {
      return res.status(404).json({ message: 'Doctor or availability not found' });
    }

    const availability = doctorResult.rows[0].availability;
    
    // Validate day of week (0-6)
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getUTCDay();

    // Check if availability is an array or object
    let dayAvailability = Array.isArray(availability) 
      ? availability.find(a => a.dayOfWeek === dayOfWeek)
      : (availability.dayOfWeek === dayOfWeek ? availability : null);

    // If no specific day config, let's assume availability applies to all working days for simplicity in MVP
    if (!dayAvailability) {
        dayAvailability = Array.isArray(availability) ? availability[0] : availability;
    }

    if (!dayAvailability) {
       return res.status(200).json({ slots: [] }); // No availability
    }

    // 2. Generate all possible slots
    const allSlots = generateSlots(dayAvailability.startTime, dayAvailability.endTime, dayAvailability.slotDuration || 15);

    // 3. Fetch booked slots for this doctor on this date
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const bookedResult = await query(`
      SELECT slot_time FROM appointments
      WHERE doctor_id = $1 AND slot_time >= $2 AND slot_time <= $3 AND status != 'cancelled'
    `, [id, startOfDay, endOfDay]);

    const bookedTimes = bookedResult.rows.map(row => {
      const d = new Date(row.slot_time);
      const hours = String(d.getUTCHours()).padStart(2, '0');
      const minutes = String(d.getUTCMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    });

    // 4. Filter out booked slots
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    res.status(200).json({ slots: availableSlots });
  } catch (error) {
    console.error('Error fetching doctor slots:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  setAvailability,
  getDoctors,
  getDoctorSlots,
};
