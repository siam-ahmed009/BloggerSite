const jwt = require('jsonwebtoken');

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('Incoming Authorization:', authHeader);

   if (!authHeader) {
    console.log('No auth header!');
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'siamahmed123');
    req.admin = decoded;
    console.log('Authenticated admin:', decoded);
    next();
  } catch (error) {
    console.log('Invalid token', error.message);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authenticateAdmin;
