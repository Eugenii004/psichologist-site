// backend/src/models/videoModel.js
const pool = require('../config/database');

const Video = {
    // Получить все видео
    getAll: async (isAdmin = false) => {
        try {
            console.log('📹 Model.getAll - isAdmin:', isAdmin);
            
            let query = 'SELECT * FROM videos';
            let params = [];
            
            if (!isAdmin) {
                query += ' WHERE is_published = true';
            }
            query += ' ORDER BY created_at DESC';
            
            console.log('🔍 SQL:', query);
            
            const result = await pool.query(query, params);
            console.log(`✅ Найдено видео: ${result.rows.length}`);
            
            return result.rows;
        } catch (error) {
            console.error('❌ Ошибка в getAll:', error);
            throw error;
        }
    },

    // Получить видео по ID
    getById: async (id, isAdmin = false) => {
        try {
            let query = 'SELECT * FROM videos WHERE id = $1';
            let params = [id];
            
            if (!isAdmin) {
                query += ' AND is_published = true';
            }
            
            console.log('🔍 SQL getById:', query, params);
            
            const result = await pool.query(query, params);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Ошибка в getById:', error);
            throw error;
        }
    },

    // Создать новое видео
    create: async (video) => {
        try {
            console.log('📹 Model.create - данные:', video);
            
            const { title, description, video_id, video_platform, duration, category, tags, is_published, thumbnail_url } = video;
            
            // Автоматическая генерация превью если не указано
            let finalThumbnail = thumbnail_url;
            if (!thumbnail_url && video_id) {
                if (video_platform === 'youtube') {
                    finalThumbnail = `https://img.youtube.com/vi/${video_id}/hqdefault.jpg`;
                } else if (video_platform === 'rutube') {
                    finalThumbnail = `https://pic.rutube.ru/video/${video_id}/screenshot.jpg`;
                }
            }
            
            const result = await pool.query(
                `INSERT INTO videos 
                (title, description, video_id, video_platform, duration, category, tags, is_published, thumbnail_url, published_at) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                RETURNING *`,
                [
                    title, 
                    description || '',
                    video_id,
                    video_platform || 'youtube',
                    duration || '00:00',
                    category || 'Общее',
                    tags ? JSON.stringify(tags) : '[]',
                    is_published || false,
                    finalThumbnail,
                    is_published ? new Date() : null
                ]
            );
            
            console.log(`✅ Видео сохранено в БД. ID: ${result.rows[0].id}`);
            return result.rows[0];
            
        } catch (error) {
            console.error('❌ Ошибка в create:', error);
            console.error('💥 SQL ошибка:', error.message);
            throw error;
        }
    },

    // Обновить видео
    update: async (id, video) => {
        try {
            const { title, description, video_id, video_platform, duration, category, tags, is_published, thumbnail_url } = video;
            
            const result = await pool.query(
                `UPDATE videos 
                SET title = $1, 
                    description = $2, 
                    video_id = $3, 
                    video_platform = $4, 
                    duration = $5, 
                    category = $6, 
                    tags = $7, 
                    is_published = $8,
                    thumbnail_url = $9,
                    published_at = CASE 
                        WHEN $8 = true AND published_at IS NULL THEN CURRENT_TIMESTAMP
                        ELSE published_at 
                    END,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $10 
                RETURNING *`,
                [
                    title, 
                    description,
                    video_id,
                    video_platform,
                    duration,
                    category,
                    tags ? JSON.stringify(tags) : '[]',
                    is_published,
                    thumbnail_url,
                    id
                ]
            );
            return result.rows[0];
        } catch (error) {
            console.error('❌ Ошибка в update:', error);
            throw error;
        }
    },

    // Удалить видео
    delete: async (id) => {
        try {
            const result = await pool.query(
                'DELETE FROM videos WHERE id = $1 RETURNING *',
                [id]
            );
            console.log(`🗑️ Видео удалено. ID: ${id}`);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Ошибка в delete:', error);
            throw error;
        }
    },

    // Увеличить счетчик просмотров
    incrementViews: async (id) => {
        try {
            const result = await pool.query(
                'UPDATE videos SET view_count = view_count + 1 WHERE id = $1 RETURNING view_count',
                [id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('❌ Ошибка в incrementViews:', error);
            throw error;
        }
    }
};

// ВАЖНО: Убедитесь, что есть экспорт!
module.exports = Video;