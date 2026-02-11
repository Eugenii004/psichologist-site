// backend/src/models/statsModel.js
const pool = require('../config/database');

const StatsModel = {
    // === Статистика по статьям ===
    getArticleStats: async () => {
        try {
            console.log('📝 Получение статистики статей...');
            
            const result = await pool.query(`
                SELECT 
                    COUNT(*) as total_articles,
                    SUM(CASE WHEN is_published = true THEN 1 ELSE 0 END) as published_articles,
                    SUM(CASE WHEN is_published = false THEN 1 ELSE 0 END) as draft_articles,
                    COALESCE(SUM(views), 0) as total_views
                FROM articles
            `);
            
            console.log('✅ Статистика статей получена');
            return result.rows[0];
            
        } catch (error) {
            console.error('❌ Ошибка получения статистики статей:', error);
            // Возвращаем нули если таблицы нет
            return { 
                total_articles: 0, 
                published_articles: 0, 
                draft_articles: 0, 
                total_views: 0 
            };
        }
    },

    // === Статистика по видео ===
    getVideoStats: async () => {
        try {
            console.log('🎥 Получение статистики видео...');
            
            // Если таблицы videos нет, вернем заглушку
            const tableExists = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'videos'
                )
            `);
            
            if (!tableExists.rows[0].exists) {
                console.log('⚠️ Таблица videos не существует, возвращаем заглушку');
                return { total_videos: 0, published_videos: 0 };
            }
            
            const result = await pool.query(`
                SELECT 
                    COUNT(*) as total_videos,
                    SUM(CASE WHEN is_published = true THEN 1 ELSE 0 END) as published_videos
                FROM videos
            `);
            
            console.log('✅ Статистика видео получена');
            return result.rows[0];
            
        } catch (error) {
            console.error('❌ Ошибка получения статистики видео:', error);
            return { total_videos: 0, published_videos: 0 };
        }
    },

    // === Статистика по форуму ===
    getForumStats: async () => {
        try {
            console.log('💬 Получение статистики форума...');
            
            // Проверяем существование таблиц форума
            const tablesExist = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'forum_topics'
                ) as topics_exist,
                EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'forum_posts'
                ) as posts_exist
            `);
            
            if (!tablesExist.rows[0].topics_exist) {
                console.log('⚠️ Таблицы форума не существуют, возвращаем заглушку');
                return { 
                    topics: 0, 
                    posts: 0, 
                    pending_topics: 0, 
                    pending_posts: 0,
                    categories: 0 
                };
            }
            
            const [topicsResult, postsResult, pendingTopicsResult, pendingPostsResult, categoriesResult] = await Promise.all([
                pool.query('SELECT COUNT(*) as count FROM forum_topics WHERE is_approved = true'),
                pool.query('SELECT COUNT(*) as count FROM forum_posts WHERE is_approved = true'),
                pool.query('SELECT COUNT(*) as count FROM forum_topics WHERE is_approved = false'),
                pool.query('SELECT COUNT(*) as count FROM forum_posts WHERE is_approved = false'),
                pool.query('SELECT COUNT(*) as count FROM forum_categories')
            ]);
            
            const stats = {
                topics: parseInt(topicsResult.rows[0].count) || 0,
                posts: parseInt(postsResult.rows[0].count) || 0,
                pending_topics: parseInt(pendingTopicsResult.rows[0].count) || 0,
                pending_posts: parseInt(pendingPostsResult.rows[0].count) || 0,
                categories: parseInt(categoriesResult.rows[0].count) || 0
            };
            
            console.log('✅ Статистика форума получена:', stats);
            return stats;
            
        } catch (error) {
            console.error('❌ Ошибка получения статистики форума:', error);
            return { 
                topics: 0, 
                posts: 0, 
                pending_topics: 0, 
                pending_posts: 0,
                categories: 0 
            };
        }
    },

    // === Статистика по пользователям ===
    getUserStats: async () => {
        try {
            console.log('👥 Получение статистики пользователей...');
            
            // Проверяем существование таблицы users
            const tableExists = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'users'
                )
            `);
            
            if (!tableExists.rows[0].exists) {
                console.log('⚠️ Таблица users не существует, возвращаем заглушку');
                return { total_users: 1, active_users: 1 };
            }
            
            const result = await pool.query(`
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
                FROM users
            `);
            
            console.log('✅ Статистика пользователей получена');
            return result.rows[0];
            
        } catch (error) {
            console.error('❌ Ошибка получения статистики пользователей:', error);
            return { total_users: 1, active_users: 1 };
        }
    },

    // === Последние статьи ===
    getRecentArticles: async (limit = 5) => {
        try {
            console.log(`📰 Получение ${limit} последних статей...`);
            
            const result = await pool.query(`
                SELECT id, title, is_published, created_at
                FROM articles
                ORDER BY created_at DESC
                LIMIT $1
            `, [limit]);
            
            console.log(`✅ Получено ${result.rows.length} последних статей`);
            return result.rows;
            
        } catch (error) {
            console.error('❌ Ошибка получения последних статей:', error);
            return [];
        }
    },

    // === Активность за последние дни ===
    getRecentActivity: async (days = 7) => {
        try {
            console.log(`📅 Получение активности за последние ${days} дней...`);
            
            const result = await pool.query(`
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as articles_created,
                    SUM(CASE WHEN is_published = true THEN 1 ELSE 0 END) as articles_published
                FROM articles
                WHERE created_at >= NOW() - INTERVAL '${days} days'
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            `);
            
            console.log(`✅ Получена активность за ${result.rows.length} дней`);
            return result.rows;
            
        } catch (error) {
            console.error('❌ Ошибка получения активности:', error);
            return [];
        }
    },

    // === Общая статистика системы ===
    getSystemStats: async () => {
        try {
            console.log('⚙️ Получение системной статистики...');
            
            // Размер базы данных
            const dbSize = await pool.query(`
                SELECT pg_database_size(current_database()) as size_bytes
            `);
            
            // Количество таблиц
            const tableCount = await pool.query(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `);
            
            // Последний бэкап (если есть таблица backups)
            let lastBackup = null;
            try {
                const backupResult = await pool.query(`
                    SELECT MAX(created_at) as last_backup 
                    FROM backups 
                    LIMIT 1
                `);
                lastBackup = backupResult.rows[0]?.last_backup;
            } catch {
                lastBackup = null;
            }
            
            const stats = {
                db_size_bytes: parseInt(dbSize.rows[0].size_bytes) || 0,
                db_size_mb: Math.round(parseInt(dbSize.rows[0].size_bytes) / (1024 * 1024) * 100) / 100 || 0,
                table_count: parseInt(tableCount.rows[0].count) || 0,
                last_backup: lastBackup,
                uptime_days: Math.floor(process.uptime() / (60 * 60 * 24)),
                node_version: process.version,
                timestamp: new Date().toISOString()
            };
            
            console.log('✅ Системная статистика получена');
            return stats;
            
        } catch (error) {
            console.error('❌ Ошибка получения системной статистики:', error);
            return {
                db_size_mb: 0,
                table_count: 0,
                last_backup: null,
                uptime_days: 0,
                node_version: process.version,
                timestamp: new Date().toISOString()
            };
        }
    },

    // === Полная статистика дашборда ===
    getDashboardStats: async () => {
        try {
            console.log('📊 Получение полной статистики для дашборда...');
            
            // Получаем все данные параллельно для скорости
            const [
                articleStats, 
                videoStats, 
                forumStats, 
                userStats, 
                recentArticles, 
                recentActivity,
                systemStats
            ] = await Promise.all([
                StatsModel.getArticleStats(),
                StatsModel.getVideoStats(),
                StatsModel.getForumStats(),
                StatsModel.getUserStats(),
                StatsModel.getRecentArticles(5),
                StatsModel.getRecentActivity(7),
                StatsModel.getSystemStats()
            ]);
            
            const stats = {
                articles: {
                    total: parseInt(articleStats.total_articles) || 0,
                    published: parseInt(articleStats.published_articles) || 0,
                    drafts: parseInt(articleStats.draft_articles) || 0,
                    views: parseInt(articleStats.total_views) || 0
                },
                videos: {
                    total: parseInt(videoStats.total_videos) || 0,
                    published: parseInt(videoStats.published_videos) || 0
                },
                forum: {
                    topics: parseInt(forumStats.topics) || 0,
                    posts: parseInt(forumStats.posts) || 0,
                    pending_topics: parseInt(forumStats.pending_topics) || 0,
                    pending_posts: parseInt(forumStats.pending_posts) || 0,
                    categories: parseInt(forumStats.categories) || 0
                },
                users: {
                    total: parseInt(userStats.total_users) || 1,
                    active: parseInt(userStats.active_users) || 1
                },
                recentArticles,
                recentActivity,
                system: systemStats,
                timestamp: new Date().toISOString()
            };
            
            console.log('✅ Полная статистика получена:', {
                articles: stats.articles.total,
                videos: stats.videos.total,
                forumTopics: stats.forum.topics,
                pendingContent: stats.forum.pending_topics + stats.forum.pending_posts
            });
            
            return stats;
            
        } catch (error) {
            console.error('💥 Критическая ошибка получения статистики дашборда:', error);
            throw error;
        }
    }
};

module.exports = StatsModel;