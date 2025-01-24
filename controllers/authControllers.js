const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY; 


const generateToken = (user) => {
  return jwt.sign(user, secretKey, { expiresIn: '1h' });
};

module.exports = { generateToken };