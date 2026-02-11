// backend/src/routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/auth');

// Все роуты защищены аутентификацией (только для админа)
router.get('/dashboard', authMiddleware, statsController.getDashboardStats);
router.get('/articles', authMiddleware, statsController.getArticleStats);
router.get('/forum', authMiddleware, statsController.getForumStats);
router.get('/videos', authMiddleware, statsController.getVideoStats);
router.get('/system', authMiddleware, statsController.getSystemStats);
router.get('/articles/recent', authMiddleware, statsController.getRecentArticles);
router.get('/activity', authMiddleware, statsController.getActivity);
router.get('/health', statsController.getHealthCheck); // Этот публичный

module.exports = router;