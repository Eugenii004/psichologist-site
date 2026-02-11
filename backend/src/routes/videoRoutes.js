// backend/src/routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Middleware для разработки (всегда пропускает)
const passAuth = (req, res, next) => {
  console.log(`🔓 ${req.method} ${req.originalUrl} - Auth passed`);
  req.admin = { id: 1, username: 'admin', role: 'admin' };
  next();
};

// Роуты
router.get('/', videoController.getAllVideos);
router.get('/:id', videoController.getVideoById);
router.post('/', passAuth, videoController.createVideo);
router.put('/:id', passAuth, videoController.updateVideo);
router.delete('/:id', passAuth, videoController.deleteVideo);

module.exports = router;