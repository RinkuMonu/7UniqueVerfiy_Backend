const jwt = require('jsonwebtoken');
const User = require('../models/User');

const
  apiMiddleware = async (req, res, next) => {
    try {
      const clientId = req.headers['client-id'];
      const token = req.headers['authorization']?.split(' ')[1];
      const env = req.headers['x-env']; // should be "credentials" or "production"
      const requestIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;


      // Validate headers
      if (!clientId || !token || !env) {
        return res.status(401).json({ message: 'Missing token, client ID, or environment' });
      }

      // Allow only environments defined in the model
      const validEnvs = ['credentials', 'production'];
      if (!validEnvs.includes(env)) {
        return res.status(400).json({ message: 'Invalid environment specified' });
      }

      // Find user where [env].authKey matches clientId
      const user = await User.findOne({ [`${env}.authKey`]: clientId });

      if (!user) {
        return res.status(403).json({ message: `No user found for the provided authKey in ${env}` });
      }

      const envConfig = user[env];

      if (!envConfig || !envConfig.isActive) {
        return res.status(403).json({ message: `Client is inactive or not configured in ${env}` });
      }

      // Verify JWT using secret from environment-specific credentials
      let decoded;
      try {
        decoded = jwt.verify(token, envConfig.jwtSecret);

      } catch (err) {
        return res.status(401).json({ message: 'Invalid jwt token', error: err.message });
      }

      // IP whitelist check
      const whitelist = envConfig.ipWhitelist || [];
      if (whitelist.length && !whitelist.includes(requestIP)) {
        return res.status(403).json({ message: `IP ${requestIP} not allowed` });
      }

      // Pass data to next middleware/controller
      req.user = user;
      req.jwtDecoded = decoded;
      req.environment = env;

      next();
    } catch (err) {
      return res.status(500).json({ message: 'API Middleware Error', error: err.message });
    }
  };

module.exports = apiMiddleware;
