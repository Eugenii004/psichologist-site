const pool = require('../config/database');

const contactController = {
    // Получить контактную информацию
    getContacts: async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM contacts LIMIT 1');
            
            if (result.rows.length === 0) {
                return res.json({
                    email: 'psychologist@example.com',
                    phone: '+7 (999) 123-45-67',
                    address: 'г. Москва, ул. Примерная, д. 10',
                    vk_link: 'https://vk.com/psychologist',
                    telegram_link: 'https://t.me/psychologist',
                    schedule: 'Пн-Пт: 10:00 - 20:00'
                });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Ошибка при получении контактов:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Обновить контактную информацию (только для админа)
    updateContacts: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Требуется авторизация' });
            }

            const { email, phone, address, vk_link, telegram_link, schedule } = req.body;
            
            // Проверяем, есть ли уже запись
            const existing = await pool.query('SELECT * FROM contacts LIMIT 1');
            
            let result;
            if (existing.rows.length > 0) {
                // Обновляем существующую запись
                result = await pool.query(
                    `UPDATE contacts 
                     SET email = $1, phone = $2, address = $3, 
                         vk_link = $4, telegram_link = $5, schedule = $6 
                     RETURNING *`,
                    [email, phone, address, vk_link, telegram_link, schedule]
                );
            } else {
                // Создаем новую запись
                result = await pool.query(
                    `INSERT INTO contacts 
                     (email, phone, address, vk_link, telegram_link, schedule) 
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                    [email, phone, address, vk_link, telegram_link, schedule]
                );
            }
            
            console.log(`📞 Админ ${req.user.username} обновил контактную информацию`);
            res.json({ 
                success: true, 
                message: 'Контакты обновлены',
                contacts: result.rows[0]
            });
        } catch (error) {
            console.error('Ошибка при обновлении контактов:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    sendMessage: async (req, res) => {
        try {
            const { name, email, phone, message, consent_processing, consent_read } = req.body;
            
            console.log('📩 Новое сообщение:', { 
                name, email, phone, 
                consent_processing, 
                consent_read 
            });
            
            // 1. Проверяем обязательные поля
            if (!name || !email || !message) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Заполните все обязательные поля: имя, email, сообщение'
                });
            }
            
            // 2. Проверяем ОБА согласия
            if (!consent_processing) {
                return res.status(400).json({
                    success: false,
                    error: 'Для отправки сообщения необходимо дать согласие на обработку персональных данных'
                });
            }
            
            if (!consent_read) {
                return res.status(400).json({
                    success: false,
                    error: 'Для отправки сообщения необходимо подтвердить ознакомление с Политикой обработки персональных данных'
                });
            }
            
            console.log('✅ Сообщение отправлено со всеми согласиями');
            
            // Сохраняем в базу с двумя флагами согласия
            const result = await pool.query(
                `INSERT INTO contact_requests 
                 (name, email, phone, message, 
                  consent_given, consent_read, 
                  consent_timestamp, consent_read_timestamp,
                  ip_address, user_agent) 
                 VALUES ($1, $2, $3, $4, $5, $6, 
                         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,
                         $7, $8) 
                 RETURNING id, created_at`,
                [
                    name, 
                    email, 
                    phone || null, 
                    message, 
                    consent_processing,
                    consent_read,
                    req.ip,
                    req.headers['user-agent']
                ]
            );
            
            const savedRequest = result.rows[0];
            console.log(`✅ Заявка сохранена с полными согласиями. ID: ${savedRequest.id}`);
            
            res.json({ 
                success: true, 
                message: 'Сообщение отправлено! Я свяжусь с вами в ближайшее время.',
                requestId: savedRequest.id
            });
            
        } catch (error) {
            console.error('❌ Ошибка при отправке сообщения:', error);
            res.status(500).json({ 
                success: false,
                error: 'Ошибка при отправке сообщения. Пожалуйста, попробуйте позже.' 
            });
        }
    },

    // ===== НОВЫЕ МЕТОДЫ ДЛЯ АДМИНКИ =====
    
    // Получить все заявки (для админки)
    getAllRequests: async (req, res) => {
        try {
            console.log('📋 GET /api/contacts/requests (ADMIN)');
            
            const result = await pool.query(`
                SELECT 
                    id, name, email, phone, message, 
                    consent_given, consent_timestamp,
                    ip_address, user_agent,
                    is_processed, processed_at,
                    created_at
                FROM contact_requests 
                ORDER BY created_at DESC
            `);
            
            console.log(`✅ Найдено заявок: ${result.rows.length}`);
            
            res.json({
                success: true,
                count: result.rows.length,
                requests: result.rows
            });
            
        } catch (error) {
            console.error('❌ Ошибка получения заявок:', error);
            res.status(500).json({ 
                success: false,
                error: 'Ошибка при получении заявок' 
            });
        }
    },

    // Отметить заявку как обработанную
    markRequestAsProcessed: async (req, res) => {
        try {
            const { id } = req.params;
            console.log(`✅ PUT /api/contacts/requests/${id}/process (ADMIN)`);
            
            const result = await pool.query(`
                UPDATE contact_requests 
                SET is_processed = true, 
                    processed_at = CURRENT_TIMESTAMP
                WHERE id = $1 
                RETURNING *
            `, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Заявка не найдена' 
                });
            }
            
            console.log(`✅ Заявка #${id} отмечена как обработанная`);
            
            res.json({
                success: true,
                message: 'Заявка обработана',
                request: result.rows[0]
            });
            
        } catch (error) {
            console.error('❌ Ошибка обработки заявки:', error);
            res.status(500).json({ 
                success: false,
                error: 'Ошибка при обработке заявки' 
            });
        }
    },

    // Удалить заявку
    deleteRequest: async (req, res) => {
        try {
            const { id } = req.params;
            console.log(`🗑️ DELETE /api/contacts/requests/${id} (ADMIN)`);
            
            const result = await pool.query(
                'DELETE FROM contact_requests WHERE id = $1 RETURNING id, name, email',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Заявка не найдена' 
                });
            }
            
            console.log(`✅ Заявка #${id} удалена`);
            
            res.json({
                success: true,
                message: 'Заявка удалена',
                deleted: result.rows[0]
            });
            
        } catch (error) {
            console.error('❌ Ошибка удаления заявки:', error);
            res.status(500).json({ 
                success: false,
                error: 'Ошибка при удалении заявки' 
            });
        }
    }

}; // ← закрываем объект contactController

module.exports = contactController;