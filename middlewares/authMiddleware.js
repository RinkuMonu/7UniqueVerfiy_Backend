
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
    
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ JWT decoded:", decoded);

      const user = await User.findById(decoded.id).select('-password');

      req.user = user;
      next();
    } catch (error) {
      console.log("❌ JWT ERROR:", error);
      console.log("JWT_SECRET:", process.env.JWT_SECRET);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};


const isAdmin = (req, res, next) => {
  console.log("🕵️‍♂️ Checking admin role for:", req.user?.role);

  if (req.user?.role?.toLowerCase() === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access only' });
  }
};



module.exports = { protect, isAdmin };
