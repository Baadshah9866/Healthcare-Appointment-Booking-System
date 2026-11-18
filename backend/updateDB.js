const { pool } = require('./config/db');

const updateDB = async () => {
  try {
    await pool.query('ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check');
    await pool.query("ALTER TABLE appointments ADD CONSTRAINT appointments_status_check CHECK (status IN ('pending', 'scheduled', 'cancelled', 'completed', 'accepted'))");
    console.log('Constraint updated');
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
};
updateDB();
