import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing in environment variables');
}

/**
 * Protect routes
 */
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user to request
    req.user = decoded;

    next();

  } catch (error) {
    console.error('JWT Error:', error.message);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Admin only middleware
 */
export const adminOnly = (req, res, next) => {
  try {
    // Ensure user exists
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.',
      });
    }

    next();

  } catch (error) {
    console.error('Admin Middleware Error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};