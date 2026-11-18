const nodemailer = require('nodemailer');

let transporter;

const initializeTransporter = async () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Generate a test account on the fly for demonstration purposes
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("Using Ethereal Email for testing.");
  }
};

initializeTransporter();

const sendEmail = async (to, subject, html) => {
  try {
    if (!transporter) await initializeTransporter();
    
    const info = await transporter.sendMail({
      from: '"CureLink Clinics" <no-reply@curelink.com>',
      to,
      subject,
      html
    });
    console.log('----------------------------------------');
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    console.log('----------------------------------------');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendBookingConfirmation = async (patientEmail, doctorEmail, patientName, doctorName, date, time) => {
  const patientSubject = 'Appointment Confirmed - CureLink';
  const patientHtml = `
    <h2>Appointment Confirmed!</h2>
    <p>Your appointment with <strong>Dr. ${doctorName}</strong> has been successfully booked.</p>
    <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
    <p><strong>Time:</strong> ${time}</p>
    <p>Thank you for choosing CureLink.</p>
  `;
  await sendEmail(patientEmail, patientSubject, patientHtml);

  if (doctorEmail) {
    const doctorSubject = 'New Appointment Booked - CureLink';
    const doctorHtml = `
      <h2>New Appointment Scheduled</h2>
      <p>A new patient, <strong>${patientName}</strong>, has booked an appointment with you.</p>
      <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p>Please log in to your dashboard to review.</p>
    `;
    await sendEmail(doctorEmail, doctorSubject, doctorHtml);
  }
};

const sendCancellationNotification = async (patientEmail, doctorEmail, patientName, doctorName, date, time, cancelledBy) => {
  const patientSubject = 'Appointment Cancelled - CureLink';
  const patientHtml = `
    <h2>Appointment Cancelled</h2>
    <p>Your appointment with <strong>Dr. ${doctorName}</strong> on <strong>${new Date(date).toLocaleDateString()} at ${time}</strong> has been cancelled by ${cancelledBy}.</p>
    <p>If you need to reschedule, please visit the CureLink dashboard.</p>
  `;
  await sendEmail(patientEmail, patientSubject, patientHtml);

  if (doctorEmail) {
    const doctorSubject = 'Appointment Cancelled - CureLink';
    const doctorHtml = `
      <h2>Appointment Cancelled</h2>
      <p>The appointment with <strong>${patientName}</strong> on <strong>${new Date(date).toLocaleDateString()} at ${time}</strong> has been cancelled by ${cancelledBy}.</p>
    `;
    await sendEmail(doctorEmail, doctorSubject, doctorHtml);
  }
};

const sendAcceptanceNotification = async (patientEmail, doctorName, date, time) => {
  const subject = 'Appointment Accepted - CureLink';
  const html = `
    <h2>Appointment Accepted!</h2>
    <p>Your appointment with <strong>Dr. ${doctorName}</strong> on <strong>${new Date(date).toLocaleDateString()} at ${time}</strong> has been accepted by the doctor.</p>
    <p>We look forward to seeing you.</p>
  `;
  await sendEmail(patientEmail, subject, html);
};

module.exports = {
  sendBookingConfirmation,
  sendCancellationNotification,
  sendAcceptanceNotification
};
