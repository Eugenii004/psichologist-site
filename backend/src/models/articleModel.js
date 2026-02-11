// backend/src/models/articleModel.js
const pool = require('../config/database');

const Article = {
    getAll: async (isAdmin = false) => {
        try {
            let query = 'SELECT id, title, content, excerpt, cover_image, is_published, created_at FROM articles';
            let params = [];
            
            if (!isAdmin) {
                query += ' WHERE is_published = true';
            }
            query += ' ORDER BY created_at DESC';
            
            console.log('🔍 SQL getAll:', query);
            const result = await pool.query(query, params);
            console.log(`✅ Найдено записей: ${result.rows.length}`);
            return result.rows;
        } catch (error) {
            console.error('❌ Ошибка в getAll:', error);
            throw error;
        }
    },

    create: async (article) => {
        try {
            const { title, content, excerpt, cover_image, is_published } = article;
            
            console.log('💾 Model.create - данные:', {
                title, 
                content_length: content?.length,
                is_published
            });
            
            const result = await pool.query(
                `INSERT INTO articles 
                (title, content, excerpt, cover_image, is_published, published_at) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *`,
                [
                    title, 
                    content, 
                    excerpt || content.substring(0, 200) + '...',
                    cover_image || null, 
                    is_published || false,
                    is_published ? new Date() : null
                ]
            );
            
            const saved = result.rows[0];
            console.log(`✅ Сохранено в БД. ID: ${saved.id}, Title: "${saved.title}"`);
            return saved;
            
        } catch (error) {
            console.error('❌ Ошибка в create:', error);
            console.error('💥 SQL ошибка:', error.message);
            throw error;
        }
    }
};