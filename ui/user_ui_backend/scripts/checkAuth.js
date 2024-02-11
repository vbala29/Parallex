const jwt = require('jsonwebtoken');

/* ENV variables */
const secretKey = process.env.SECRET_KEY;

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, secretKey);
    req.userData = { userId: decodedToken.userId, email: decodedToken.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};