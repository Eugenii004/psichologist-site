// backend/src/middleware/auth.js
const authMiddleware = (req, res, next) => {
  console.log('✅ DEV: Auth middleware пропускает запрос');
  req.admin = {
    id: 1,
    email: 'admin@example.com',
    role: 'admin',
    username: 'admin'
  };
  return next();
};

module.exports = authMiddleware;