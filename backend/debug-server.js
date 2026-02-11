// debug-server.js
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Логируем ВСЕ запросы
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  next();
});

// Тестовые эндпоинты
app.post('/api/test1', (req, res) => res.json({ test: 1 }));
app.post('/api/test2', (req, res) => res.json({ test: 2 }));

// Основной эндпоинт
app.post('/api/articles', (req, res) => {
  console.log('Articles endpoint hit!');
  res.status(201).json({ success: true, body: req.body });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Debug server on port ${PORT}`);
});