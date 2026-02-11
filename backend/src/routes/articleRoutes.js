// backend/src/routes/articleRoutes.js
const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController'); // ← убедитесь что путь правильный
const noAuth = require('../middleware/noAuth');

// Публичные роуты
router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);

// Защищенные роуты
router.post('/', noAuth, articleController.createArticle);
router.put('/:id', noAuth, articleController.updateArticle);
router.delete('/:id', noAuth, articleController.deleteArticle);

module.exports = router;