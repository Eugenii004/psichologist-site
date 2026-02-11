// backend/src/routes/forumRoutes.js
const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const authMiddleware = require('../middleware/auth');

// Публичные роуты
router.get('/categories', forumController.getAllCategories);
router.get('/topics', forumController.getAllTopics);
router.get('/topics/:id', forumController.getTopicById);
router.post('/topics', forumController.createTopic);
router.post('/topics/:id/posts', forumController.createPost);
router.get('/stats', forumController.getForumStats); // ← ДОБАВЬТЕ ЭТО!

// Админские роуты (модерация)
router.get('/moderation/topics', authMiddleware, forumController.getPendingTopics);
router.get('/moderation/posts', authMiddleware, forumController.getPendingPosts);
router.put('/moderation/topics/:id/approve', authMiddleware, forumController.approveTopic);
router.put('/moderation/posts/:id/approve', authMiddleware, forumController.approvePost);
router.delete('/moderation/topics/:id', authMiddleware, forumController.deleteTopic);
router.delete('/moderation/posts/:id', authMiddleware, forumController.deletePost);
router.get('/admin/topics', authMiddleware, forumController.getAllTopicsAdmin);
router.delete('/admin/topics/:id', authMiddleware, forumController.deleteTopic);
router.delete('/admin/posts/:id', authMiddleware, forumController.deletePost);
router.get('/admin/topics', authMiddleware, forumController.getAllTopicsAdmin);
router.get('/admin/posts', authMiddleware, forumController.getAllPostsAdmin);
router.delete('/admin/topics/:id', authMiddleware, forumController.deleteTopicAdmin);
router.delete('/admin/posts/:id', authMiddleware, forumController.deletePostAdmin);

module.exports = router;