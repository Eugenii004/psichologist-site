// backend/src/controllers/articleController.js
const pool = require('../config/database');

const articleController = {
    // Получить все статьи
    getAllArticles: async (req, res) => {
        try {
            console.log('📰 GET /api/articles');
            const result = await pool.query(
                'SELECT id, title, content, excerpt, cover_image, is_published, created_at FROM articles WHERE is_published = true ORDER BY created_at DESC'
            );
            console.log(`✅ Найдено статей: ${result.rows.length}`);
            res.json(result.rows);
        } catch (error) {
            console.error('❌ Ошибка получения статей:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Получить статью по ID
    getArticleById: async (req, res) => {
        try {
            const result = await pool.query(
                'SELECT * FROM articles WHERE id = $1 AND is_published = true',
                [req.params.id]
            );
            if (result.rows[0]) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'Статья не найдена' });
            }
        } catch (error) {
            console.error('Ошибка при получении статьи:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Создать новую статью
    createArticle: async (req, res) => {
        try {
            console.log('📝 POST /api/articles - Данные:', req.body);
            
            const { title, content, excerpt, cover_image, is_published } = req.body;
            
            if (!title || !content) {
                return res.status(400).json({ error: 'Заголовок и содержание обязательны' });
            }
            
            // Прямой запрос к БД
            const result = await pool.query(
                `INSERT INTO articles (title, content, excerpt, cover_image, is_published, published_at) 
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
            
            const article = result.rows[0];
            console.log(`✅ Статья создана. ID: ${article.id}, Заголовок: "${article.title}"`);
            
            res.status(201).json(article);
            
        } catch (error) {
            console.error('💥 Ошибка создания статьи:', error);
            res.status(500).json({ 
                error: 'Ошибка сервера',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Обновить статью
    updateArticle: async (req, res) => {
        try {
            const { title, content, excerpt, cover_image, is_published } = req.body;
            
            const result = await pool.query(
                `UPDATE articles 
                 SET title = $1, 
                     content = $2, 
                     excerpt = $3, 
                     cover_image = $4, 
                     is_published = $5,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $6 
                 RETURNING *`,
                [title, content, excerpt, cover_image, is_published, req.params.id]
            );
            
            if (result.rows[0]) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'Статья не найдена' });
            }
        } catch (error) {
            console.error('Ошибка при обновлении статьи:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Удалить статью
    deleteArticle: async (req, res) => {
        try {
            const result = await pool.query(
                'DELETE FROM articles WHERE id = $1 RETURNING *',
                [req.params.id]
            );
            
            if (result.rows[0]) {
                res.json({ message: 'Статья удалена', article: result.rows[0] });
            } else {
                res.status(404).json({ error: 'Статья не найдена' });
            }
        } catch (error) {
            console.error('Ошибка при удалении статьи:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
};

// ВАЖНО: экспортируем объект
module.exports = articleController;