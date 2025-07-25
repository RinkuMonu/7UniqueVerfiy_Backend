
const sendEmail = (to, subject, body) => {
  console.log(`📧 Email to: \${to} | Subject: \${subject} | Body: \${body}`);
};

const sendSMS = (number, message) => {
  console.log(`📱 SMS to: \${number} | Message: \${message}`);
};

module.exports = { sendEmail, sendSMS };
