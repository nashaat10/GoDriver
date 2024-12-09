import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // Ensure the path is correct

// Middleware to protect routes (Authentication)
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]; // Extract token
    }

    if (!token) {
      return res.status(401).json({ 
        status: 'fail', 
        message: 'Not authorized, no token provided' 
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user to the request
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({ 
        status: 'fail', 
        message: 'User no longer exists' 
      });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ 
      status: 'fail', 
      message: 'Not authorized, invalid token' 
    });
  }
};

// Middleware for role-based access control (Authorization)
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    try {
      // Ensure req.user exists
      if (!req.user) {
        return res.status(401).json({ 
          status: 'fail', 
          message: 'Not authorized, user not found' 
        });
      }

      // Check if user's role is allowed
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          status: 'fail', 
          message: 'You do not have permission to perform this action' 
        });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Server error in authorization middleware' 
      });
    }
  };
};
