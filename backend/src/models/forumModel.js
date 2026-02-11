const pool = require('../config/database');

const Forum = {
    // ===== КАТЕГОРИИ =====
    // Получить все категории
    getAllCategories: async () => {
        const result = await pool.query(
            'SELECT * FROM forum_categories ORDER BY order_index'
        );
        return result.rows;
    },

    // Получить категорию по ID
    getCategoryById: async (id) => {
        const result = await pool.query(
            'SELECT * FROM forum_categories WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    // Создать категорию
    createCategory: async (category) => {
        const { name, description, order_index } = category;
        const result = await pool.query(
            `INSERT INTO forum_categories (name, description, order_index) 
             VALUES ($1, $2, $3) RETURNING *`,
            [name, description, order_index]
        );
        return result.rows[0];
    },

    // Обновить категорию
    updateCategory: async (id, category) => {
        const { name, description, order_index } = category;
        const result = await pool.query(
            `UPDATE forum_categories 
             SET name = $1, description = $2, order_index = $3 
             WHERE id = $4 RETURNING *`,
            [name, description, order_index, id]
        );
        return result.rows[0];
    },

    // Удалить категорию
    deleteCategory: async (id) => {
        const result = await pool.query(
            'DELETE FROM forum_categories WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    },

    // ===== ТЕМЫ =====
    // Получить все темы с пагинацией
    getAllTopics: async (page = 1, limit = 10, categoryId = null, onlyApproved = true) => {
        const offset = (page - 1) * limit;
        let query = `
            SELECT t.*, c.name as category_name,
                   (SELECT COUNT(*) FROM forum_posts WHERE topic_id = t.id) as post_count,
                   (SELECT MAX(created_at) FROM forum_posts WHERE topic_id = t.id) as last_activity
            FROM forum_topics t
            LEFT JOIN forum_categories c ON t.category_id = c.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;

        if (onlyApproved) {
            query += ` AND t.is_approved = true`;
        }

        if (categoryId) {
            query += ` AND t.category_id = $${paramCount}`;
            params.push(categoryId);
            paramCount++;
        }

        query += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        return result.rows;
    },

    // Получить общее количество тем
    getTopicsCount: async (categoryId = null, onlyApproved = true) => {
        let query = 'SELECT COUNT(*) FROM forum_topics WHERE 1=1';
        const params = [];
        
        if (onlyApproved) {
            query += ' AND is_approved = true';
        }

        if (categoryId) {
            query += ' AND category_id = $1';
            params.push(categoryId);
        }

        const result = await pool.query(query, params);
        return parseInt(result.rows[0].count);
    },

    // Получить тему по ID
    getTopicById: async (id) => {
        const result = await pool.query(
            `SELECT t.*, c.name as category_name 
             FROM forum_topics t
             LEFT JOIN forum_categories c ON t.category_id = c.id
             WHERE t.id = $1`,
            [id]
        );
        return result.rows[0];
    },

    // Создать тему
    createTopic: async (topic) => {
        const { title, content, category_id, author_name, author_email } = topic;
        const result = await pool.query(
            `INSERT INTO forum_topics (title, content, category_id, author_name, author_email) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title, content, category_id, author_name, author_email]
        );
        return result.rows[0];
    },

    // Обновить тему
    updateTopic: async (id, topic) => {
        const { title, content, category_id, is_approved } = topic;
        const result = await pool.query(
            `UPDATE forum_topics 
             SET title = $1, content = $2, category_id = $3, is_approved = $4 
             WHERE id = $5 RETURNING *`,
            [title, content, category_id, is_approved, id]
        );
        return result.rows[0];
    },

    // Удалить тему
    deleteTopic: async (id) => {
        const result = await pool.query(
            'DELETE FROM forum_topics WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    },

    // Одобрить тему (модерация)
    approveTopic: async (id) => {
        const result = await pool.query(
            'UPDATE forum_topics SET is_approved = true WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    },

    // ===== СООБЩЕНИЯ =====
    // Получить сообщения темы
    getPostsByTopicId: async (topicId, page = 1, limit = 20) => {
        const offset = (page - 1) * limit;
        const result = await pool.query(
            `SELECT * FROM forum_posts 
             WHERE topic_id = $1 
             ORDER BY created_at ASC 
             LIMIT $2 OFFSET $3`,
            [topicId, limit, offset]
        );
        return result.rows;
    },

    // Получить количество сообщений в теме
    getPostsCount: async (topicId) => {
        const result = await pool.query(
            'SELECT COUNT(*) FROM forum_posts WHERE topic_id = $1',
            [topicId]
        );
        return parseInt(result.rows[0].count);
    },

    // Создать сообщение
    createPost: async (post) => {
        const { topic_id, content, author_name } = post;
        const result = await pool.query(
            `INSERT INTO forum_posts (topic_id, content, author_name) 
             VALUES ($1, $2, $3) RETURNING *`,
            [topic_id, content, author_name]
        );
        return result.rows[0];
    },

    // Обновить сообщение
    updatePost: async (id, content) => {
        const result = await pool.query(
            `UPDATE forum_posts 
             SET content = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 RETURNING *`,
            [content, id]
        );
        return result.rows[0];
    },

    // Удалить сообщение
    deletePost: async (id) => {
        const result = await pool.query(
            'DELETE FROM forum_posts WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    },

    // ===== СТАТИСТИКА =====
    // Получить статистику форума
    getForumStats: async () => {
        const result = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM forum_topics WHERE is_approved = true) as topics_count,
                (SELECT COUNT(*) FROM forum_posts) as posts_count,
                (SELECT COUNT(*) FROM forum_categories) as categories_count,
                (SELECT COUNT(*) FROM forum_topics WHERE is_approved = false) as pending_topics
        `);
        return result.rows[0];
    },

    // Получить последнюю активность
    getRecentActivity: async (limit = 10) => {
        const result = await pool.query(`
            (SELECT 
                'topic' as type,
                id,
                title,
                created_at,
                author_name,
                NULL as content
            FROM forum_topics 
            WHERE is_approved = true
            ORDER BY created_at DESC 
            LIMIT $1)
            
            UNION ALL
            
            (SELECT 
                'post' as type,
                p.id,
                t.title,
                p.created_at,
                p.author_name,
                p.content
            FROM forum_posts p
            JOIN forum_topics t ON p.topic_id = t.id
            WHERE t.is_approved = true
            ORDER BY p.created_at DESC 
            LIMIT $1)
            
            ORDER BY created_at DESC 
            LIMIT $1
        `, [limit]);
        
        return result.rows;
    }
};

module.exports = Forum;