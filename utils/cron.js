
const cron = require('node-cron');
const User = require('../models/User');
const { sendEmail } = require('./notifications');

// Send daily usage report to admin
cron.schedule('0 9 * * *', async () => {
  console.log('🕘 Running daily report cron...');
  const users = await User.find().select('email serviceUsage');
  const report = users.map(user => ({
    email: user.email,
    usage: user.serviceUsage
  }));

  sendEmail('admin@example.com', 'Daily Usage Report', JSON.stringify(report, null, 2));
});

// Low wallet alert
cron.schedule('*/30 * * * *', async () => {
  console.log('⏰ Checking for low wallet balances...');
  const users = await User.find({ wallet: { $lt: 50 } });
  users.forEach(user => {
    sendEmail(user.email, 'Low Wallet Alert', 'Your wallet balance is below ₹50. Please top-up soon.');
  });
});
