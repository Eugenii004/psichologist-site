// backend/src/middleware/noAuth.js
module.exports = (req, res, next) => {
    console.log('⚠️  NO AUTH: Пропускаем без проверки');
    req.admin = { id: 1, role: 'admin' };
    next();
  };