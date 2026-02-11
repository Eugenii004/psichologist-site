// backend/src/controllers/statsController.js
const StatsModel = require('../models/statsModel');

const statsController = {
    // === Полная статистика дашборда ===
    getDashboardStats: async (req, res) => {
        try {
            console.log('🚀 GET /api/stats/dashboard - Запрос от пользователя:', req.admin?.username || 'неизвестный');
            
            // Логируем запрос
            console.log('📡 Детали запроса:', {
                ip: req.ip,
                method: req.method,
                url: req.originalUrl,
                userAgent: req.headers['user-agent']
            });
            
            // Получаем полную статистику
            const stats = await StatsModel.getDashboardStats();
            
            // Добавляем информацию о запросе
            stats.requestInfo = {
                requestedAt: new Date().toISOString(),
                user: req.admin?.username || 'anonymous',
                role: req.admin?.role || 'guest'
            };
            
            // Отправляем ответ с дополнительными заголовками для кэширования
            res.set({
                'Cache-Control': 'private, max-age=60', // Кэшируем на 60 секунд
                'X-Stats-Version': '1.0',
                'X-Generated-At': stats.timestamp
            });
            
            console.log('✅ Отправка статистики дашборда:', {
                articles: stats.articles.total,
                pendingContent: stats.forum.pending_topics + stats.forum.pending_posts,
                responseSize: JSON.stringify(stats).length + ' bytes'
            });
            
            res.json({
                success: true,
                data: stats,
                message: 'Статистика успешно получена'
            });
            
        } catch (error) {
            console.error('💥 Ошибка получения статистики дашборда:', error);
            
            // Логируем полную ошибку
            console.error('🔍 Детали ошибки:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            
            res.status(500).json({
                success: false,
                error: 'Не удалось получить статистику',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                timestamp: new Date().toISOString()
            });
        }
    },

    // === Статистика только по статьям ===
    getArticleStats: async (req, res) => {
        try {
            console.log('📝 GET /api/stats/articles');
            
            const stats = await StatsModel.getArticleStats();
            
            res.json({
                success: true,
                data: {
                    total: parseInt(stats.total_articles) || 0,
                    published: parseInt(stats.published_articles) || 0,
                    drafts: parseInt(stats.draft_articles) || 0,
                    views: parseInt(stats.total_views) || 0
                },
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Ошибка получения статистики статей:', error);
            res.status(500).json({
                success: false,
                error: 'Не удалось получить статистику статей'
            });
        }
    },

    // === Статистика только по форуму ===
    getForumStats: async (req, res) => {
        try {
            console.log('💬 GET /api/stats/forum');
            
            const stats = await StatsModel.getForumStats();
            
            res.json({
                success: true,
                data: {
                    topics: stats.topics || 0,
                    posts: stats.posts || 0,
                    pending_topics: stats.pending_topics || 0,
                    pending_posts: stats.pending_posts || 0,
                    categories: stats.categories || 0
                },
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Ошибка получения статистики форума:', error);
            res.status(500).json({
                success: false,
                error: 'Не удалось получить статистику форума'
            });
        }
    },

    // === Статистика только по видео ===
    getVideoStats: async (req, res) => {
        try {
            console.log('🎥 GET /api/stats/videos');
            
            const stats = await StatsModel.getVideoStats();
            
            res.json({
                success: true,
                data: {
                    total: parseInt(stats.total_videos) || 0,
                    published: parseInt(stats.published_videos) || 0
                },
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Ошибка получения статистики видео:', error);
            res.status(500).json({
                success: false,
                error: 'Не удалось получить статистику видео'
            });
        }
    },

    // === Системная статистика ===
    getSystemStats: async (req, res) => {
        try {
            console.log('⚙️ GET /api/stats/system');
            
            const stats = await StatsModel.getSystemStats();
            
            res.json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Ошибка получения системной статистики:', error);
            res.status(500).json({
                success: false,
                error: 'Не удалось получить системную статистику'
            });
        }
    },

    // === Последние статьи ===
    getRecentArticles: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 5;
            console.log(`📰 GET /api/stats/articles/recent?limit=${limit}`);
            
            const articles = await StatsModel.getRecentArticles(limit);
            
            res.json({
                success: true,
                data: articles,
                count: articles.length,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Ошибка получения последних статей:', error);
            res.status(500).json({
                success: false,
                error: 'Не удалось получить последние статьи'
            });
        }
    },

    // === Активность за период ===
    getActivity: async (req, res) => {
        try {
            const days = parseInt(req.query.days) || 7;
            console.log(`📅 GET /api/stats/activity?days=${days}`);
            
            const activity = await StatsModel.getRecentActivity(days);
            
            res.json({
                success: true,
                data: activity,
                period: `${days} дней`,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Ошибка получения активности:', error);
            res.status(500).json({
                success: false,
                error: 'Не удалось получить активность'
            });
        }
    },

    // === Проверка здоровья системы ===
    getHealthCheck: async (req, res) => {
        try {
            console.log('🏥 GET /api/stats/health');
            
            // Проверяем подключение к БД
            const dbCheck = await require('../config/database').query('SELECT NOW() as time');
            
            // Получаем базовую статистику
            const [articleStats, forumStats] = await Promise.all([
                StatsModel.getArticleStats(),
                StatsModel.getForumStats()
            ]);
            
            const health = {
                status: 'healthy',
                services: {
                    database: dbCheck.rows[0] ? 'connected' : 'disconnected',
                    api: 'running',
                    timestamp: new Date().toISOString()
                },
                metrics: {
                    articles: parseInt(articleStats.total_articles) || 0,
                    forum_topics: forumStats.topics || 0,
                    pending_content: (forumStats.pending_topics || 0) + (forumStats.pending_posts || 0)
                },
                server: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    node_version: process.version
                }
            };
            
            res.json({
                success: true,
                data: health,
                message: 'Система работает нормально'
            });
            
        } catch (error) {
            console.error('💥 Ошибка проверки здоровья:', error);
            
            res.status(503).json({
                success: false,
                status: 'unhealthy',
                error: 'Проблемы с системой',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                timestamp: new Date().toISOString()
            });
        }
    }
};

module.exports = statsController;