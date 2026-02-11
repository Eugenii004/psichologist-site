const ForumCategory = require('../models/forumCategoryModel');
const ForumTopic = require('../models/forumTopicModel');
const ForumPost = require('../models/forumPostModel');

const forumController = {
    // === Категории ===
    getAllCategories: async (req, res) => {
        try {
            console.log('📂 GET /api/forum/categories');
            const categories = await ForumCategory.getAll();
            console.log(`✅ Найдено категорий: ${categories.length}`);
            res.json(categories);
        } catch (error) {
            console.error('❌ Ошибка получения категорий:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // === Темы ===
    getAllTopics: async (req, res) => {
        try {
            console.log('📚 GET /api/forum/topics');
            const isAdmin = req.admin ? true : false;
            const topics = await ForumTopic.getAll(isAdmin);
            console.log(`✅ Найдено тем: ${topics.length}`);
            res.json(topics);
        } catch (error) {
            console.error('❌ Ошибка получения тем:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Получить ВСЕ темы (только для админа - включая одобренные)
getAllTopicsAdmin: async (req, res) => {
    try {
        console.log('👮 GET /api/forum/admin/topics (ADMIN)');
        // isAdmin = true чтобы получить все темы
        const topics = await ForumTopic.getAll(true);
        console.log(`✅ Всего тем (включая одобренные): ${topics.length}`);
        res.json(topics);
    } catch (error) {
        console.error('❌ Ошибка получения всех тем:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
},

    getTopicById: async (req, res) => {
        try {
            console.log(`📖 GET /api/forum/topics/${req.params.id}`);
            const isAdmin = req.admin ? true : false;
            const topic = await ForumTopic.getById(req.params.id, isAdmin);
            
            if (topic) {
                // Увеличиваем просмотры
                await ForumTopic.incrementViews(req.params.id);
                
                // Получаем сообщения
                const posts = await ForumPost.getByTopic(req.params.id, isAdmin);
                console.log(`✅ Найдено сообщений в теме: ${posts.length}`);
                res.json({ topic, posts });
            } else {
                res.status(404).json({ error: 'Тема не найдена' });
            }
        } catch (error) {
            console.error('❌ Ошибка получения темы:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    createTopic: async (req, res) => {
        try {
            console.log('📝 POST /api/forum/topics - Данные:', req.body);
            
            // Проверяем ОБА согласия
            if (!req.body.consent_processing && !req.body.consent) {
                return res.status(400).json({
                    error: 'Для создания темы необходимо дать согласие на обработку персональных данных'
                });
            }
            
            if (!req.body.consent_read) {
                return res.status(400).json({
                    error: 'Для создания темы необходимо подтвердить ознакомление с Политикой обработки персональных данных'
                });
            }
            
            // Используем consent_processing или устаревшее consent
            const consentProcessing = req.body.consent_processing || req.body.consent;
            
            // Сохраняем оба согласия
            const topicData = {
                ...req.body,
                is_approved: false,
                consent_given: consentProcessing,
                consent_read: req.body.consent_read
            };
            
            const topic = await ForumTopic.create(topicData);
            console.log(`✅ Тема создана с полными согласиями. ID: ${topic.id}`);
            
            res.status(201).json(topic);
        } catch (error) {
            console.error('❌ Ошибка создания темы:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },
    
    createPost: async (req, res) => {
        try {
            console.log('💬 POST /api/forum/topics/:id/posts - Данные:', req.body);
            
            // Проверяем ОБА согласия
            if (!req.body.consent_processing && !req.body.consent) {
                return res.status(400).json({
                    error: 'Для публикации сообщения необходимо дать согласие на обработку персональных данных'
                });
            }
            
            if (!req.body.consent_read) {
                return res.status(400).json({
                    error: 'Для публикации сообщения необходимо подтвердить ознакомление с Политикой обработки персональных данных'
                });
            }
            
            // Используем consent_processing или устаревшее consent
            const consentProcessing = req.body.consent_processing || req.body.consent;
            
            const postData = {
                ...req.body,
                is_approved: false,
                consent_given: consentProcessing,
                consent_read: req.body.consent_read
            };
            
            const post = await ForumPost.create(postData);
            console.log(`✅ Сообщение создано с полными согласиями. ID: ${post.id}`);
            
            res.status(201).json(post);
        } catch (error) {
            console.error('❌ Ошибка создания сообщения:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // === Модерация (только для админа) ===
    getPendingTopics: async (req, res) => {
        try {
            console.log('👮 GET /api/forum/moderation/topics (ADMIN)');
            const topics = await ForumTopic.getPending();
            console.log(`⏳ Тем на модерации: ${topics.length}`);
            res.json(topics);
        } catch (error) {
            console.error('❌ Ошибка получения тем на модерации:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    getPendingPosts: async (req, res) => {
        try {
            console.log('👮 GET /api/forum/moderation/posts (ADMIN)');
            const posts = await ForumPost.getPending();
            console.log(`⏳ Сообщений на модерации: ${posts.length}`);
            res.json(posts);
        } catch (error) {
            console.error('❌ Ошибка получения сообщений на модерации:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    approveTopic: async (req, res) => {
        try {
            console.log(`✅ PUT /api/forum/moderation/topics/${req.params.id}/approve (ADMIN)`);
            const topic = await ForumTopic.approve(req.params.id);
            console.log(`👍 Тема одобрена: "${topic.title}"`);
            res.json({ message: 'Тема одобрена', topic });
        } catch (error) {
            console.error('❌ Ошибка одобрения темы:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    approvePost: async (req, res) => {
        try {
            console.log(`✅ PUT /api/forum/moderation/posts/${req.params.id}/approve (ADMIN)`);
            const post = await ForumPost.approve(req.params.id);
            console.log(`👍 Сообщение одобрено. ID: ${post.id}`);
            res.json({ message: 'Сообщение одобрено', post });
        } catch (error) {
            console.error('❌ Ошибка одобрения сообщения:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    deleteTopic: async (req, res) => {
        try {
            console.log(`🗑️ DELETE /api/forum/moderation/topics/${req.params.id} (ADMIN)`);
            const topic = await ForumTopic.delete(req.params.id);
            console.log(`🗑️ Тема удалена: "${topic.title}"`);
            res.json({ message: 'Тема удалена', topic });
        } catch (error) {
            console.error('❌ Ошибка удаления темы:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    deletePost: async (req, res) => {
        try {
            console.log(`🗑️ DELETE /api/forum/moderation/posts/${req.params.id} (ADMIN)`);
            const post = await ForumPost.delete(req.params.id);
            console.log(`🗑️ Сообщение удалено. ID: ${post.id}`);
            res.json({ message: 'Сообщение удалено', post });
        } catch (error) {
            console.error('❌ Ошибка удаления сообщения:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    },

    // Получить ВСЕ темы (только для админа)
getAllTopicsAdmin: async (req, res) => {
    try {
        console.log('👮 GET /api/forum/admin/topics (ADMIN)');
        const topics = await ForumTopic.getAll(true); // true = показывать все темы
        console.log(`✅ Всего тем: ${topics.length}`);
        res.json(topics);
    } catch (error) {
        console.error('❌ Ошибка получения всех тем:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
},

// Получить ВСЕ сообщения (только для админа)
getAllPostsAdmin: async (req, res) => {
    try {
        console.log('👮 GET /api/forum/admin/posts (ADMIN)');
        const result = await pool.query(`
            SELECT fp.*, ft.title as topic_title
            FROM forum_posts fp
            LEFT JOIN forum_topics ft ON fp.topic_id = ft.id
            ORDER BY fp.created_at DESC
        `);
        console.log(`✅ Всего сообщений: ${result.rows.length}`);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Ошибка получения всех сообщений:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
},

// Удалить тему через админку
deleteTopicAdmin: async (req, res) => {
    try {
        console.log(`🗑️ DELETE /api/forum/admin/topics/${req.params.id} (ADMIN)`);
        const topic = await ForumTopic.delete(req.params.id);
        console.log(`🗑️ Тема удалена: "${topic?.title || req.params.id}"`);
        res.json({ 
            message: 'Тема удалена', 
            topic 
        });
    } catch (error) {
        console.error('❌ Ошибка удаления темы:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
},

// Удалить сообщение через админку
deletePostAdmin: async (req, res) => {
    try {
        console.log(`🗑️ DELETE /api/forum/admin/posts/${req.params.id} (ADMIN)`);
        const post = await ForumPost.delete(req.params.id);
        console.log(`🗑️ Сообщение удалено. ID: ${post?.id || req.params.id}`);
        res.json({ 
            message: 'Сообщение удалено', 
            post 
        });
    } catch (error) {
        console.error('❌ Ошибка удаления сообщения:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
},

    // === Статистика форума ===
    getForumStats: async (req, res) => {
        try {
            console.log('📊 GET /api/forum/stats');
            
            // Получаем статистику с учетом согласий
            const [topicsCount, postsCount, pendingTopics, pendingPosts, topicsWithConsent, postsWithConsent] = await Promise.all([
                pool.query('SELECT COUNT(*) as count FROM forum_topics WHERE is_approved = true'),
                pool.query('SELECT COUNT(*) as count FROM forum_posts WHERE is_approved = true'),
                pool.query('SELECT COUNT(*) as count FROM forum_topics WHERE is_approved = false'),
                pool.query('SELECT COUNT(*) as count FROM forum_posts WHERE is_approved = false'),
                pool.query('SELECT COUNT(*) as count FROM forum_topics WHERE consent_given = true'),
                pool.query('SELECT COUNT(*) as count FROM forum_posts WHERE consent_given = true')
            ]);

            const stats = {
                topics: parseInt(topicsCount.rows[0].count) || 0,
                posts: parseInt(postsCount.rows[0].count) || 0,
                pendingTopics: parseInt(pendingTopics.rows[0].count) || 0,
                pendingPosts: parseInt(pendingPosts.rows[0].count) || 0,
                topicsWithConsent: parseInt(topicsWithConsent.rows[0].count) || 0,
                postsWithConsent: parseInt(postsWithConsent.rows[0].count) || 0,
                lastUpdated: new Date().toISOString()
            };

            console.log('📊 Статистика форума:', stats);
            res.json(stats);
            
        } catch (error) {
            console.error('❌ Ошибка получения статистики форума:', error);
            res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
};

module.exports = forumController;