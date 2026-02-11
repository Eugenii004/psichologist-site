const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Вход администратора
router.post('/login', async (req, res) => {
    try {
        console.log('📥 Запрос на вход:', req.body);
        const { username, password } = req.body;
        
        if (!username || !password) {
            console.log('❌ Отсутствуют username или password');
            return res.status(400).json({ 
                success: false,
                error: 'Имя пользователя и пароль обязательны' 
            });
        }
        
        console.log(`🔍 Ищу пользователя: ${username}`);
        
        // Тестируем подключение к БД
        try {
            const testQuery = await pool.query('SELECT NOW()');
            console.log('✅ Подключение к БД работает:', testQuery.rows[0]);
        } catch (dbError) {
            console.error('❌ Ошибка подключения к БД:', dbError.message);
            return res.status(500).json({
                success: false,
                error: 'Ошибка подключения к базе данных'
            });
        }
        
        // Находим пользователя
        const result = await pool.query(
            'SELECT * FROM admins WHERE username = $1',
            [username]
        );
        
        console.log(`🔍 Найдено пользователей: ${result.rows.length}`);
        
        if (result.rows.length === 0) {
            console.log(`❌ Пользователь ${username} не найден`);
            return res.status(401).json({ 
                success: false,
                error: 'Неверные учетные данные' 
            });
        }
        
        const admin = result.rows[0];
        console.log(`👤 Найден пользователь: ${admin.username}, ID: ${admin.id}`);
        
        // Проверяем пароль
        console.log('🔐 Проверка пароля...');
        const isValidPassword = await bcrypt.compare(password, admin.password_hash);
        
        if (!isValidPassword) {
            console.log('❌ Неверный пароль');
            return res.status(401).json({ 
                success: false,
                error: 'Неверные учетные данные' 
            });
        }
        
        console.log('✅ Пароль верный');
        
        // Создаем JWT токен
        const token = jwt.sign(
            { 
                id: admin.id, 
                username: admin.username,
                role: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log(`✅ Токен создан для ${admin.username}`);
        
        res.json({
            success: true,
            message: 'Авторизация успешна',
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                role: 'admin'
            }
        });
        
    } catch (error) {
        console.error('🔥 Ошибка при авторизации:', error);
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Проверка токена
router.post('/verify', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: 'Токен не предоставлен' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        res.json({
            success: true,
            admin: decoded
        });
        
    } catch (error) {
        res.status(401).json({ 
            success: false,
            error: 'Неверный или просроченный токен' 
        });
    }
});

// Тестовый endpoint для проверки подключения
router.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        res.json({
            success: true,
            database: 'PostgreSQL',
            connected: true,
            current_time: result.rows[0].current_time
        });
    } catch (error) {
        res.json({
            success: false,
            database: 'PostgreSQL',
            connected: false,
            error: error.message
        });
    }
});

// Тестовый endpoint для проверки таблицы admins
router.get('/test-admins', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM admins');
        res.json({
            success: true,
            table: 'admins',
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        res.json({
            success: false,
            table: 'admins',
            error: error.message,
            hint: 'Возможно таблица не существует'
        });
    }
});

// Простой тестовый роут
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Auth routes работают!',
        status: 'OK' 
    });
});

// ⭐⭐⭐ ВАЖНО: ДОБАВЬТЕ ЭТУ СТРОКУ В САМЫЙ КОНЕЦ ФАЙЛА ⭐⭐⭐
module.exports = router;