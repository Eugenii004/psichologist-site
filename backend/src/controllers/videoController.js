// backend/src/controllers/videoController.js
const Video = require('../models/videoModel');

const videoController = {
    // Получить все видео
    getAllVideos: async (req, res) => {
        try {
            console.log('📹 GET /api/videos');
            const isAdmin = req.admin ? true : false;
            const videos = await Video.getAll(isAdmin);
            console.log(`✅ Найдено видео: ${videos.length}`);
            res.json(videos);
        } catch (error) {
            console.error('❌ Ошибка при получении видео:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Получить видео по ID
    getVideoById: async (req, res) => {
        try {
            const isAdmin = req.admin ? true : false;
            const video = await Video.getById(req.params.id, isAdmin);
            
            if (video) {
                // Увеличиваем просмотры если не админ
                if (!isAdmin) {
                    await Video.incrementViews(req.params.id);
                }
                res.json(video);
            } else {
                res.status(404).json({ error: 'Видео не найдено' });
            }
        } catch (error) {
            console.error('Ошибка при получении видео:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Создать новое видео
    createVideo: async (req, res) => {
        try {
            console.log('🎬 CREATE VIDEO - Запрос:', req.body);
            console.log('👤 Пользователь:', req.admin || 'Не указан');
            
            // Валидация обязательных полей
            if (!req.body.title || !req.body.title.trim()) {
                return res.status(400).json({ error: 'Заголовок обязателен' });
            }
            
            if (!req.body.video_id || !req.body.video_id.trim()) {
                return res.status(400).json({ error: 'ID видео обязателен' });
            }
            
            if (!req.body.video_platform) {
                return res.status(400).json({ error: 'Платформа видео обязательна' });
            }
            
            // Создаем видео
            const video = await Video.create({
                title: req.body.title,
                description: req.body.description || '',
                video_id: req.body.video_id,
                video_platform: req.body.video_platform || 'rutube',
                duration: req.body.duration || '00:00',
                category: req.body.category || 'Общее',
                tags: req.body.tags || [],
                is_published: req.body.is_published !== undefined ? req.body.is_published : true,
                thumbnail_url: req.body.thumbnail_url || null
            });
            
            console.log(`✅ Видео создано: "${video.title}" (ID: ${video.id})`);
            res.status(201).json(video);
            
        } catch (error) {
            console.error('💥 Ошибка при создании видео:', error);
            console.error('💥 Stack:', error.stack);
            res.status(500).json({ 
                error: 'Ошибка сервера',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Обновить видео
    updateVideo: async (req, res) => {
        try {
            console.log('✏️ UPDATE VIDEO - ID:', req.params.id);
            console.log('Данные:', req.body);
            
            const video = await Video.update(req.params.id, req.body);
            
            if (video) {
                console.log(`✅ Видео обновлено: ${video.id}`);
                res.json(video);
            } else {
                res.status(404).json({ error: 'Видео не найдено' });
            }
        } catch (error) {
            console.error('Ошибка при обновлении видео:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Удалить видео
    deleteVideo: async (req, res) => {
        try {
            console.log('🗑️ DELETE VIDEO - ID:', req.params.id);
            
            const video = await Video.delete(req.params.id);
            
            if (video) {
                console.log(`✅ Видео удалено: "${video.title}"`);
                res.json({ message: 'Видео удалено', video });
            } else {
                res.status(404).json({ error: 'Видео не найдено' });
            }
        } catch (error) {
            console.error('Ошибка при удалении видео:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Получить популярные видео
    getPopularVideos: async (req, res) => {
        try {
            const pool = require('../config/database');
            const result = await pool.query(
                'SELECT * FROM videos WHERE is_published = true ORDER BY view_count DESC LIMIT 10'
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Ошибка при получении популярных видео:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
};

module.exports = videoController;