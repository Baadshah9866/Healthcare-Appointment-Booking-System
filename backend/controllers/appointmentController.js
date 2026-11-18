const { query, pool } = require('../config/db');
const { sendBookingConfirmation, sendCancellationNotification } = require('../utils/emailService');

const bookAppointment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { doctorId, date, time } = req.body;
    const patientId = req.user.id;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const slotTimeStr = `${date}T${time}:00.000Z`;

    // Start transaction
    await client.query('BEGIN');

    // Check for double booking using a UNIQUE constraint catch or by explicit lock
    const existing = await client.query(
      'SELECT id FROM appointments WHERE doctor_id = $1 AND slot_time = $2 AND status != $3 FOR UPDATE',
      [doctorId, slotTimeStr, 'cancelled']
    );

    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'Slot already booked' });
    }

    // Book the appointment
    const newAppointment = await client.query(
      'INSERT INTO appointments (doctor_id, patient_id, slot_time, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [doctorId, patientId, slotTimeStr, 'pending']
    );

    await client.query('COMMIT');

    // Send email asynchronously without blocking the response
    client.query('SELECT name, email FROM users WHERE id = $1', [patientId]).then(userResult => {
      client.query('SELECT name, email FROM users WHERE id = $1', [doctorId]).then(doctorResult => {
        if (userResult.rows.length > 0 && doctorResult.rows.length > 0) {
          const patient = userResult.rows[0];
          const doctor = doctorResult.rows[0];
          sendBookingConfirmation(
            patient.email, 
            doctor.email,
            patient.name,
            doctor.name, 
            date, 
            time
          ).catch(console.error);
        }
      });
    });

    res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment.rows[0] });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Booking Error:', error);
    // Handle unique constraint violation gracefully
    if (error.code === '23505') {
        return res.status(409).json({ message: 'Slot already booked' });
    }
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

const getAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let result;
    if (role === 'doctor') {
      result = await query(`
        SELECT a.id, a.slot_time, a.status, u.name as patient_name, u.email as patient_email
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        WHERE a.doctor_id = $1
        ORDER BY a.slot_time DESC
      `, [userId]);
    } else {
      result = await query(`
        SELECT a.id, a.slot_time, a.status, u.name as doctor_name, d.specialization, d.qualification, d.experience
        FROM appointments a
        JOIN users u ON a.doctor_id = u.id
        JOIN doctors d ON d.user_id = u.id
        WHERE a.patient_id = $1
        ORDER BY a.slot_time DESC
      `, [userId]);
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Fetch Appointments Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // We only allow users to cancel their own appointments, or doctors to cancel theirs
    const appointment = await query('SELECT * FROM appointments WHERE id = $1', [id]);
    
    if (appointment.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appt = appointment.rows[0];
    if (appt.patient_id !== userId && appt.doctor_id !== userId) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const result = await query(
      "UPDATE appointments SET status = 'cancelled' WHERE id = $1 RETURNING *",
      [id]
    );

    // Send cancellation email
    query('SELECT name, email FROM users WHERE id = $1', [appt.patient_id]).then(patientResult => {
      query('SELECT name FROM users WHERE id = $1', [appt.doctor_id]).then(doctorResult => {
        if (patientResult.rows.length > 0 && doctorResult.rows.length > 0) {
          const patient = patientResult.rows[0];
          const doctor = doctorResult.rows[0];
          
          const d = new Date(appt.slot_time);
          const apptDate = d.toISOString().split('T')[0];
          const apptTime = d.toISOString().split('T')[1].substring(0, 5);
          
          const cancelledBy = req.user.role === 'doctor' ? 'the Doctor' : 'the Patient';

          sendCancellationNotification(patient.email, doctor.email, patient.name, doctor.name, apptDate, apptTime, cancelledBy).catch(console.error);
        }
      });
    });

    res.status(200).json({ message: 'Appointment cancelled', appointment: result.rows[0] });
  } catch (error) {
    console.error('Cancel Appointment Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const acceptAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await query('SELECT * FROM appointments WHERE id = $1', [id]);
    
    if (appointment.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appt = appointment.rows[0];
    if (appt.doctor_id !== userId) {
        return res.status(403).json({ message: 'Unauthorized. Only the doctor can accept.' });
    }

    const result = await query(
      "UPDATE appointments SET status = 'accepted' WHERE id = $1 RETURNING *",
      [id]
    );

    // Send acceptance email
    query('SELECT name, email FROM users WHERE id = $1', [appt.patient_id]).then(patientResult => {
      query('SELECT name, email FROM users WHERE id = $1', [appt.doctor_id]).then(doctorResult => {
        if (patientResult.rows.length > 0 && doctorResult.rows.length > 0) {
          const patient = patientResult.rows[0];
          const doctor = doctorResult.rows[0];
          
          const d = new Date(appt.slot_time);
          const apptDate = d.toISOString().split('T')[0];
          const apptTime = d.toISOString().split('T')[1].substring(0, 5);
          
          const { sendAcceptanceNotification } = require('../utils/emailService');
          sendAcceptanceNotification(patient.email, doctor.name, apptDate, apptTime).catch(console.error);
        }
      });
    });

    res.status(200).json({ message: 'Appointment accepted', appointment: result.rows[0] });
  } catch (error) {
    console.error('Accept Appointment Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  cancelAppointment,
  acceptAppointment
};
