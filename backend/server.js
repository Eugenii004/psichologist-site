const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Импорт роутов
const articleRoutes = require('./src/routes/articleRoutes');
const videoRoutes = require('./src/routes/videoRoutes');
const authRoutes = require('./src/routes/authRoutes'); 
const forumRoutes = require('./src/routes/forumRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ ЕДИНСТВЕННЫЙ ПРАВИЛЬНЫЙ CORS - ОДИН РАЗ!
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://ваш-домен.timeweb.cloud',
    'https://www.ваш-домен.timeweb.cloud'
];

app.use(cors({
    origin: function (origin, callback) {
        // Разрешаем запросы без origin (Postman, curl, etc)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('CORS: Этот источник не разрешен: ' + origin), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Эти middleware должны быть ПОСЛЕ CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Логирование запросов (опционально, для отладки)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// ✅ Роуты
app.use('/api/articles', articleRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/contacts', contactRoutes);

// ✅ Специальный middleware для контактов
app.use('/api/contacts/message', (req, res, next) => {
    console.log('📩 Входящая заявка:', {
        time: new Date().toISOString(),
        ip: req.ip,
        name: req.body.name,
        email: req.body.email,
        consent: req.body.consent
    });
    next();
});

// ✅ Тестовые роуты
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Сервер работает!',
        cors: 'enabled',
        allowedOrigins: allowedOrigins
    });
});

// ✅ Тестовый POST
app.post('/api/test/video', (req, res) => {
    console.log('🔍 TEST VIDEO ENDPOINT - Body:', req.body);
    console.log('🔍 Headers:', req.headers);
    
    res.json({
        success: true,
        message: 'Test endpoint works!',
        received: req.body,
        timestamp: new Date().toISOString()
    });
});

// ✅ Главная страница
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>API Психолога</title>
                <style>
                    body { font-family: Arial; padding: 40px; line-height: 1.6; }
                    h1 { color: #333; }
                    a { color: #0066cc; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                    .endpoint { background: #f4f4f4; padding: 10px; margin: 10px 0; border-radius: 5px; }
                </style>
            </head>
            <body>
                <h1>🧠 API сайта психолога</h1>
                <p>Сервер работает на порту <strong>${PORT}</strong></p>
                <p>Окружение: <strong>${process.env.NODE_ENV || 'development'}</strong></p>
                
                <h2>Доступные эндпоинты:</h2>
                
                <div class="endpoint">
                    <strong>📊 Health check:</strong> 
                    <a href="/api/health">/api/health</a>
                </div>
                
                <div class="endpoint">
                    <strong>📝 Статьи:</strong> 
                    <a href="/api/articles">/api/articles</a>
                </div>
                
                <div class="endpoint">
                    <strong>🎥 Видео:</strong> 
                    <a href="/api/videos">/api/videos</a>
                </div>
                
                <div class="endpoint">
                    <strong>💬 Форум:</strong> 
                    <a href="/api/forum">/api/forum</a>
                </div>
                
                <div class="endpoint">
                    <strong>📞 Контакты:</strong> 
                    <a href="/api/contacts">/api/contacts</a>
                </div>
                
                <div class="endpoint">
                    <strong>🔐 Auth:</strong> 
                    <a href="/api/auth">/api/auth</a>
                </div>
                
                <div class="endpoint">
                    <strong>📈 Статистика:</strong> 
                    <a href="/api/stats">/api/stats</a>
                </div>
                
                <div class="endpoint">
                    <strong>🧪 Тест GET:</strong> 
                    <a href="/api/test">/api/test</a>
                </div>
                
                <div class="endpoint">
                    <strong>🧪 Тест POST:</strong> 
                    /api/test/video
                </div>
                
                <h3>✅ CORS настроен и работает</h3>
                <p>Разрешённые источники:</p>
                <ul>
                    ${allowedOrigins.map(origin => `<li>${origin}</li>`).join('')}
                </ul>
            </body>
        </html>
    `);
});

// ✅ Обработка 404
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        message: `Маршрут ${req.method} ${req.url} не найден`
    });
});

// ✅ Обработка ошибок (ДОЛЖНА БЫТЬ ПОСЛЕДНЕЙ!)
app.use((err, req, res, next) => {
    console.error('❌ Ошибка сервера:', err);
    
    // Ошибка CORS
    if (err.message.includes('CORS')) {
        return res.status(403).json({ 
            error: 'CORS Error', 
            message: err.message,
            origin: req.headers.origin 
        });
    }
    
    // Другие ошибки
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так'
    });
});

// ✅ Запуск сервера
app.listen(PORT, () => {
    console.log(`
    🚀 Сервер успешно запущен!
    📍 Порт: ${PORT}
    🌐 Режим: ${process.env.NODE_ENV || 'development'}
    🔗 Локальный: http://localhost:${PORT}
    🔗 API тест: http://localhost:${PORT}/api/test
    🔗 Health: http://localhost:${PORT}/api/health
    
    📝 Доступные роуты:
    - Статьи: /api/articles
    - Видео: /api/videos
    - Форум: /api/forum
    - Контакты: /api/contacts
    - Auth: /api/auth
    - Статистика: /api/stats
    `);
});

module.exports = app;