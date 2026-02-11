const pool = require('../config/database');

const Contact = {
    // === СУЩЕСТВУЮЩИЕ ФУНКЦИИ (остаются без изменений) ===
    
    // 1. Получить контактную информацию (для страницы контактов)
    get: async () => {
        const result = await pool.query(
            'SELECT * FROM site_contacts LIMIT 1'
        );
        return result.rows[0];
    },

    // 2. Обновить контактную информацию (в админке)
    update: async (contact) => {
        const { email, phone, address, vk_link, telegram_link, schedule } = contact;
        
        const existing = await pool.query('SELECT * FROM site_contacts LIMIT 1');
        
        if (existing.rows.length > 0) {
            const result = await pool.query(
                `UPDATE site_contacts 
                 SET email = $1, phone = $2, address = $3, 
                     vk_link = $4, telegram_link = $5, schedule = $6,
                     updated_at = CURRENT_TIMESTAMP 
                 RETURNING *`,
                [email, phone, address, vk_link, telegram_link, schedule]
            );
            return result.rows[0];
        } else {
            const result = await pool.query(
                `INSERT INTO site_contacts 
                 (email, phone, address, vk_link, telegram_link, schedule) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [email, phone, address, vk_link, telegram_link, schedule]
            );
            return result.rows[0];
        }
    },

    // === НОВЫЕ ФУНКЦИИ для обработки заявок ===

    // 3. Создать новую заявку из формы "Напишите мне"
    createRequest: async (requestData) => {
        const { name, email, phone, message, consent } = requestData;
        
        const query = `
            INSERT INTO contact_requests 
            (name, email, phone, message, consent_given)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const values = [name, email, phone, message, consent || false];
        
        try {
            const result = await pool.query(query, values);
            console.log(`✅ Заявка создана. ID: ${result.rows[0].id}`);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Ошибка при создании заявки:', error);
            throw error;
        }
    },

    // 4. Получить все заявки (для админки)
    getAllRequests: async () => {
        const query = `
            SELECT id, name, email, phone, message, 
                   consent_given, consent_timestamp, created_at,
                   is_processed, processed_at
            FROM contact_requests 
            ORDER BY created_at DESC
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('❌ Ошибка при получении заявок:', error);
            throw error;
        }
    },

    // 5. Получить заявку по ID
    getRequestById: async (id) => {
        const query = `
            SELECT * FROM contact_requests 
            WHERE id = $1
        `;
        
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error(`❌ Ошибка при получении заявки ${id}:`, error);
            throw error;
        }
    },

    // 6. Отметить заявку как обработанную
    markAsProcessed: async (id) => {
        const query = `
            UPDATE contact_requests 
            SET is_processed = true, 
                processed_at = CURRENT_TIMESTAMP
            WHERE id = $1 
            RETURNING *
        `;
        
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error(`❌ Ошибка при обновлении заявки ${id}:`, error);
            throw error;
        }
    },

    // 7. Удалить заявку (для админки)
    deleteRequest: async (id) => {
        const query = `
            DELETE FROM contact_requests 
            WHERE id = $1 
            RETURNING id, name, email
        `;
        
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error(`❌ Ошибка при удалении заявки ${id}:`, error);
            throw error;
        }
    },

    // 8. Получить статистику по заявкам
    getRequestsStats: async () => {
        const query = `
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN is_processed = true THEN 1 END) as processed,
                COUNT(CASE WHEN is_processed = false THEN 1 END) as pending,
                COUNT(CASE WHEN consent_given = true THEN 1 END) as with_consent,
                COUNT(CASE WHEN consent_given = false THEN 1 END) as without_consent
            FROM contact_requests
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Ошибка при получении статистики:', error);
            throw error;
        }
    }
};

module.exports = Contact;