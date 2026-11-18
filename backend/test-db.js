const { Client } = require('pg');
const client = new Client('postgres://postgres:roshan@localhost:5432/clinic_db');
client.connect().then(async () => {
  try {
    await client.query("INSERT INTO users (name, email, password, role) VALUES ('Test', 'test@test.com', 'pass', 'patient')");
    console.log('success');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
});
