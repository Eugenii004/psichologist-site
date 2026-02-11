const pool = require('../config/database');

const ForumPost = {
    getByTopic: async (topicId, isAdmin = false) => {
        let query = `
            SELECT fp.*, 
                   fp.consent_given,
                   fp.consent_timestamp
            FROM forum_posts fp 
            WHERE fp.topic_id = $1
        `;
        
        if (!isAdmin) {
            query += ' AND fp.is_approved = true';
        }
        
        query += ' ORDER BY fp.created_at ASC';
        
        try {
            console.log('🔍 SQL getByTopic posts, topicId:', topicId);
            const result = await pool.query(query, [topicId]);
            console.log(`✅ Найдено сообщений в теме: ${result.rows.length}`);
            return result.rows;
        } catch (error) {
            console.error('❌ Ошибка в getByTopic:', error);
            throw error;
        }
    },

    getPending: async () => {
        try {
            console.log('🔍 SQL getPending posts');
            const result = await pool.query(`
                SELECT fp.*, ft.title as topic_title,
                       fp.consent_given,
                       fp.consent_timestamp
                FROM forum_posts fp
                LEFT JOIN forum_topics ft ON fp.topic_id = ft.id
                WHERE fp.is_approved = false 
                ORDER BY fp.created_at DESC
            `);
            console.log(`✅ Найдено сообщений на модерации: ${result.rows.length}`);
            return result.rows;
        } catch (error) {
            console.error('❌ Ошибка в getPending:', error);
            throw error;
        }
    },

    create: async (post) => {
        const { topic_id, content, author_name, author_email, consent_given, consent_read } = post;
        
        try {
            console.log('📝 Создание сообщения:', { 
                topic_id, author_name, consent_given, consent_read 
            });
            
            // Проверяем, получено ли согласие
            if (!consent_given) {
                throw new Error('Согласие на обработку данных не получено');
            }
            
            if (!consent_read) {
                throw new Error('Подтверждение ознакомления с политикой не получено');
            }
            
            const result = await pool.query(
                `INSERT INTO forum_posts 
                 (topic_id, content, author_name, author_email, 
                  is_approved, consent_given, consent_read,
                  consent_timestamp, consent_read_timestamp) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7,
                         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
                 RETURNING *`,
                [topic_id, content, author_name, author_email, 
                 false, consent_given, consent_read]
            );
            const savedPost = result.rows[0];
            console.log(`✅ Сообщение создано. ID: ${savedPost.id}, Согласие: ${savedPost.consent_given}`);
            return savedPost;
        } catch (error) {
            console.error('❌ Ошибка в create:', error);
            throw error;
        }
    },

    update: async (id, post) => {
        const { content, is_approved } = post;
        try {
            console.log('✏️ Обновление сообщения ID:', id);
            const result = await pool.query(
                `UPDATE forum_posts 
                 SET content = $1, is_approved = $2, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $3 RETURNING *`,
                [content, is_approved, id]
            );
            console.log(`✅ Сообщение обновлено. Затронуто строк: ${result.rowCount}`);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Ошибка в update:', error);
            throw error;
        }
    },

    approve: async (id) => {
        try {
            console.log('✅ Одобрение сообщения ID:', id);
            const result = await pool.query(
                `UPDATE forum_posts 
                 SET is_approved = true, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1 RETURNING *`,
                [id]
            );
            const approvedPost = result.rows[0];
            console.log(`✅ Сообщение одобрено. ID: ${approvedPost.id}`);
            return approvedPost;
        } catch (error) {
            console.error('❌ Ошибка в approve:', error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            console.log('🗑️ Удаление сообщения ID:', id);
            const result = await pool.query(
                'DELETE FROM forum_posts WHERE id = $1 RETURNING *',
                [id]
            );
            const deletedPost = result.rows[0];
            console.log(`✅ Сообщение удалено. ID: ${deletedPost?.id || 'не найдено'}`);
            return deletedPost;
        } catch (error) {
            console.error('❌ Ошибка в delete:', error);
            throw error;
        }
    }
};

module.exports = ForumPost;