const { pool } = require('../config/db');

const createTables = async () => {
  const queryText = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin'))
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      specialization VARCHAR(255) NOT NULL,
      qualification VARCHAR(255),
      experience INT,
      availability JSONB
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      doctor_id UUID REFERENCES users(id) ON DELETE CASCADE,
      patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
      slot_time TIMESTAMP NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
      UNIQUE(doctor_id, slot_time)
    );
  `;

  try {
    await pool.query(queryText);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    pool.end();
  }
};

createTables();
