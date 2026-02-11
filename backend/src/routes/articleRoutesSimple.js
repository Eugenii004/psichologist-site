// backend/src/routes/articleRoutesSimple.js
const express = require('express');
const router = express.Router();

// Простейший middleware
const passAuth = (req, res, next) => {
  console.log('✅ PASS AUTH: пропускаем всё');
  req.user = { id: 1, role: 'admin' };
  next();
};

// Роуты
router.get('/', (req, res) => {
  res.json([{ id: 1, title: 'Test' }]);
});

router.post('/', passAuth, (req, res) => {
  console.log('📝 Creating article:', req.body);
  res.status(201).json({
    id: Date.now(),
    ...req.body,
    created_at: new Date()
  });
});

module.exports = router;