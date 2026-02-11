// backend/src/models/forumCategoryModel.js
const pool = require('../config/database');

const ForumCategory = {
    getAll: async () => {
        try {
            console.log('🔍 SQL getAll categories');
            const result = await pool.query(
                'SELECT * FROM forum_categories ORDER BY name'
            );
            console.log(`✅ Найдено категорий: ${result.rows.length}`);
            return result.rows;
        } catch (error) {
            console.error('❌ Ошибка в getAll:', error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            console.log('🔍 SQL getById category, ID:', id);
            const result = await pool.query(
                'SELECT * FROM forum_categories WHERE id = $1',
                [id]
            );
            console.log(`✅ Найдена категория: ${result.rows.length > 0 ? result.rows[0].name : 'нет'}`);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Ошибка в getById:', error);
            throw error;
        }
    },

    create: async (category) => {
        const { name, description } = category;
        try {
            console.log('📝 Создание категории:', { name, description });
            const result = await pool.query(
                `INSERT INTO forum_categories (name, description) 
                 VALUES ($1, $2) RETURNING *`,
                [name, description]
            );
            console.log(`✅ Категория создана. ID: ${result.rows[0].id}, Name: "${result.rows[0].name}"`);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Ошибка в create:', error);
            throw error;
        }
    },

    update: async (id, category) => {
        const { name, description } = category;
        try {
            console.log('✏️ Обновление категории ID:', id, 'данные:', category);
            const result = await pool.query(
                `UPDATE forum_categories 
                 SET name = $1, description = $2 
                 WHERE id = $3 RETURNING *`,
                [name, description, id]
            );
            console.log(`✅ Категория обновлена. Затронуто строк: ${result.rowCount}`);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Ошибка в update:', error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            console.log('🗑️ Удаление категории ID:', id);
            const result = await pool.query(
                'DELETE FROM forum_categories WHERE id = $1 RETURNING *',
                [id]
            );
            console.log(`✅ Категория удалена. ID: ${result.rows[0]?.id || 'не найдена'}`);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Ошибка в delete:', error);
            throw error;
        }
    }
};

module.exports = ForumCategory;