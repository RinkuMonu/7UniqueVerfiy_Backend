
const User = require('../models/User');

const ipWhitelist = async (req, res, next) => {
  const user = req.user;

  if (!user || !user.credentials || !user.credentials.ipWhitelist || user.credentials.ipWhitelist.length === 0) {
    return res.status(403).json({ message: 'No IP whitelist configured' });
  }

  const requestIP =
    req.headers['x-forwarded-for']?.split(',').shift() || req.socket.remoteAddress;

  if (!user.credentials.ipWhitelist.includes(requestIP)) {
    return res.status(403).json({ message: `IP ${requestIP} not allowed` });
  }

  next();
};

module.exports = ipWhitelist;
