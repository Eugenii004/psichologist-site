const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Импорт роутов
const articleRoutes = require('./src/routes/articleRoutes');
const videoRoutes = require('./src/routes/videoRoutes');
const authRoutes = require('./src/routes/authRoutes'); 
const forumRoutes = require('./src/routes/forumRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 3000; // Timeweb использует 3000 порт

// Настройки для Timeweb
const allowedOrigins = [
  'http://localhost:3000',
  `https://${process.env.DOMAIN || 'ваш-проект.timeweb.cloud'}`,
  `https://www.${process.env.DOMAIN || 'ваш-проект.timeweb.cloud'}`
];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS с настройкой для фронтенда
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Проверка окружения
console.log('🚀 Environment:', process.env.NODE_ENV);
console.log('🔗 Allowed origins:', allowedOrigins);

// Обслуживаем статику из фронтенда
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../../frontend/build');
  console.log('📁 Frontend build path:', frontendBuildPath);
  
  app.use(express.static(frontendBuildPath));
  
  // Проверяем доступность статики
  app.get('/check-static', (req, res) => {
    const fs = require('fs');
    const exists = fs.existsSync(path.join(frontendBuildPath, 'index.html'));
    res.json({ 
      staticExists: exists,
      path: frontendBuildPath,
      files: exists ? fs.readdirSync(frontendBuildPath) : []
    });
  });
}

// Роуты API
app.use('/api/articles', articleRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/contacts', contactRoutes);

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

// Тестовые роуты
app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      port: PORT
    });
});

app.get('/api/test', (req, res) => {
    res.json({ 
      message: 'Сервер работает!',
      frontend: process.env.NODE_ENV === 'production' ? 'Production' : 'Development'
    });
});

// Логирование всех запросов (для отладки)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// В продакшене все остальные запросы идут на фронтенд
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build', 'index.html'));
  });
}

// Главная страница (только в разработке)
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>API Психолога (Development)</title></head>
            <body>
                <h1>API сайта психолога</h1>
                <p>Сервер работает на порту ${PORT}</p>
                <p>Environment: ${process.env.NODE_ENV}</p>
                <p><a href="/api/articles">Статьи</a></p>
                <p><a href="/api/health">Health Check</a></p>
                <p><a href="/check-static">Check Static Files</a></p>
            </body>
        </html>
    `);
  });
}

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 Сервер запущен!
    📍 Port: ${PORT}
    🌐 Environment: ${process.env.NODE_ENV || 'development'}
    🔗 Health check: http://localhost:${PORT}/api/health
    📁 Static: ${process.env.NODE_ENV === 'production' ? 'Enabled' : 'Disabled'}
    `);
    
    if (process.env.DB_HOST) {
      console.log(`🗄️ Database: ${process.env.DB_HOST}`);
    }
});