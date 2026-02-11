const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/auth');

// Публичные роуты
router.get('/', contactController.getContacts);           // Получить контакты сайта
router.post('/message', contactController.sendMessage);   // Отправить сообщение

// Защищенные роуты (только для админа)
router.put('/', authMiddleware, contactController.updateContacts); // Обновить контакты

// ===== НОВЫЕ РОУТЫ ДЛЯ УПРАВЛЕНИЯ ЗАЯВКАМИ =====
router.get('/requests', authMiddleware, contactController.getAllRequests); // Все заявки
router.put('/requests/:id/process', authMiddleware, contactController.markRequestAsProcessed); // Обработать
router.delete('/requests/:id', authMiddleware, contactController.deleteRequest); // Удалить

module.exports = router;