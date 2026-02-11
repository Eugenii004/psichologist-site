// backend/src/models/forumTopicModel.js
const pool = require('../config/database');

const ForumTopic = {
    // Получить все темы
    getAll: async (isAdmin = false) => {
        let query = `
            SELECT ft.*, fc.name as category_name 
            FROM forum_topics ft
            LEFT JOIN forum_categories fc ON ft.category_id = fc.id
        `;
        
        if (!isAdmin) {
            query += ' WHERE ft.is_approved = true';
        }
        
        query += ' ORDER BY ft.created_at DESC';
        
        try {
            console.log('🔍 SQL getAll topics:', query);
            const result = await pool.query(query);
            console.log(`✅ Найдено тем: ${result.rows.length}`);
            return result.rows;
        } catch (error) {
            console.error('❌ Ошибка в getAll:', error);
            throw error;
        }
    },

    // Получить тему по ID
    getById: async (id, isAdmin = false) => {
        let query = `
            SELECT ft.*, fc.name as category_name 
            FROM forum_topics ft
            LEFT JOIN forum_categories fc ON ft.category_id = fc.id
            WHERE ft.id = $1
        `;
        
        const params = [id];
        
        if (!isAdmin) {
            query += ' AND ft.is_approved = true';
        }
        
        try {
            console.log('🔍 SQL getById topic:', query, 'ID:', id);
            const result = await pool.query(query, params);
            console.log(`✅ Найдена тема: ${result.rows.length > 0 ? result.rows[0].title : 'нет'}`);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Ошибка в getById:', error);
            throw error;
        }
    },

    // Получить темы по категории
    getByCategory: async (categoryId, isAdmin = false) => {
        let query = `
            SELECT ft.*, fc.name as category_name 
            FROM forum_topics ft
            LEFT JOIN forum_categories fc ON ft.category_id = fc.id
            WHERE ft.category_id = $1
        `;
        
        const params = [categoryId];
        
        if (!isAdmin) {
            query += ' AND ft.is_approved = true';
        }
        
        query += ' ORDER BY ft.created_at DESC';
        
        try {
            console.log('🔍 SQL getByCategory:', query, 'categoryId:', categoryId);
            const result = await pool.query(query, params);
            console.log(`✅ Найдено тем в категории: ${result.rows.length}`);
            return result.rows;
        } catch (error) {
            console.error('❌ Ошибка в getByCategory:', error);
            throw error;
        }
    },

    // Получить темы на модерации
    getPending: async () => {
        try {
            console.log('🔍 SQL getPending topics');
            const result = await pool.query(`
                SELECT ft.*, fc.name as category_name 
                FROM forum_topics ft
                LEFT JOIN forum_categories fc ON ft.category_id = fc.id
                WHERE ft.is_approved = false 
                ORDER BY ft.created_at DESC
            `);
            console.log(`✅ Найдено тем на модерации: ${result.rows.length}`);
            return result.rows;
        } catch (error) {
            console.error('❌ Ошибка в getPending:', error);
            throw error;
        }
    },

    // Создать новую тему
    create: async (topic) => {
        const { 
            title, content, category_id, 
            author_name, author_email, 
            consent_given, consent_read 
        } = topic;
        
        try {
            console.log('📝 Создание темы с согласиями:', { 
                title, consent_given, consent_read 
            });
            
            const result = await pool.query(
                `INSERT INTO forum_topics 
                 (title, content, category_id, author_name, author_email, 
                  is_approved, consent_given, consent_read,
                  consent_timestamp, consent_read_timestamp) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 
                         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
                 RETURNING *`,
                [title, content, category_id, author_name, author_email, 
                 false, consent_given, consent_read]
            );
            
            const savedTopic = result.rows[0];
            console.log(`✅ Тема создана с согласиями. ID: ${savedTopic.id}`);
            return savedTopic;
            
        } catch (error) {
            console.error('❌ Ошибка в create:', error);
            throw error;
        }
    },
    
    // Обновить тему
    update: async (id, topic) => {
        const { title, content, category_id, is_approved, is_locked } = topic;
        
        try {
            console.log('✏️ Обновление темы ID:', id, 'данные:', topic);
            
            const result = await pool.query(
                `UPDATE forum_topics 
                 SET title = $1, 
                     content = $2, 
                     category_id = $3, 
                     is_approved = $4, 
                     is_locked = $5, 
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $6 
                 RETURNING *`,
                [title, content, category_id, is_approved, is_locked, id]
            );
            
            console.log(`✅ Тема обновлена. Затронуто строк: ${result.rowCount}`);
            return result.rows[0];
            
        } catch (error) {
            console.error('❌ Ошибка в update:', error);
            throw error;
        }
    },

    // Одобрить тему
    approve: async (id) => {
        try {
            console.log('✅ Одобрение темы ID:', id);
            
            const result = await pool.query(
                `UPDATE forum_topics 
                 SET is_approved = true, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1 
                 RETURNING *`,
                [id]
            );
            
            const approvedTopic = result.rows[0];
            console.log(`✅ Тема одобрена. ID: ${approvedTopic.id}, Title: "${approvedTopic.title}"`);
            return approvedTopic;
            
        } catch (error) {
            console.error('❌ Ошибка в approve:', error);
            throw error;
        }
    },

    // Удалить тему
    delete: async (id) => {
        try {
            console.log('🗑️ Удаление темы ID:', id);
            
            const result = await pool.query(
                'DELETE FROM forum_topics WHERE id = $1 RETURNING *',
                [id]
            );
            
            const deletedTopic = result.rows[0];
            console.log(`✅ Тема удалена. ID: ${deletedTopic?.id || 'не найдена'}`);
            return deletedTopic;
            
        } catch (error) {
            console.error('❌ Ошибка в delete:', error);
            throw error;
        }
    },

    // Увеличить счетчик просмотров
    incrementViews: async (id) => {
        try {
            await pool.query(
                'UPDATE forum_topics SET views = views + 1 WHERE id = $1',
                [id]
            );
            console.log(`👁️ Увеличен счетчик просмотров для темы ID: ${id}`);
        } catch (error) {
            console.error('❌ Ошибка увеличения просмотров:', error);
        }
    }
};

module.exports = ForumTopic;