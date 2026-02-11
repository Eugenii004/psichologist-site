import axios from 'axios';

// Базовый URL вашего бэкенда
const API_BASE_URL = 'http://localhost:5000/api';

// Создаем экземпляр axios с настройками
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ===== СЕРВИС ДЛЯ РАБОТЫ СО СТАТЬЯМИ =====
export const articleService = {
    // Получить все статьи
    getAll: async () => {
        try {
            const response = await api.get('/articles');
            return response.data;
        } catch (error) {
            console.error('Ошибка при загрузке статей:', error);
            throw error;
        }
    },

    // Получить статью по ID
    getById: async (id) => {
        try {
            const response = await api.get(`/articles/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка при загрузке статьи ${id}:`, error);
            throw error;
        }
    },

    // Создать статью
    create: async (articleData, token) => {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.post('/articles', articleData, { headers });
            return response.data;
        } catch (error) {
            console.error('Ошибка при создании статьи:', error);
            throw error;
        }
    },

    // Обновить статью
    update: async (id, articleData, token) => {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.put(`/articles/${id}`, articleData, { headers });
            return response.data;
        } catch (error) {
            console.error(`Ошибка при обновлении статьи ${id}:`, error);
            throw error;
        }
    },

    // Удалить статью
    delete: async (id, token) => {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.delete(`/articles/${id}`, { headers });
            return response.data;
        } catch (error) {
            console.error(`Ошибка при удалении статьи ${id}:`, error);
            throw error;
        }
    }
};

// ===== СЕРВИС ДЛЯ РАБОТЫ С ВИДЕО =====
export const videoService = {
    // Получить все видео
    getAll: async () => {
        try {
            const response = await api.get('/videos');
            return response.data;
        } catch (error) {
            console.error('Ошибка при загрузке видео:', error);
            throw error;
        }
    },

    // Получить видео по ID
    getById: async (id) => {
        try {
            const response = await api.get(`/videos/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка при загрузке видео ${id}:`, error);
            throw error;
        }
    },

    // Создать видео
    create: async (videoData, token) => {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.post('/videos', videoData, { headers });
            return response.data;
        } catch (error) {
            console.error('Ошибка при создании видео:', error);
            throw error;
        }
    },

    // Обновить видео
    update: async (id, videoData, token) => {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.put(`/videos/${id}`, videoData, { headers });
            return response.data;
        } catch (error) {
            console.error(`Ошибка при обновлении видео ${id}:`, error);
            throw error;
        }
    },

    // Удалить видео
    delete: async (id, token) => {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.delete(`/videos/${id}`, { headers });
            return response.data;
        } catch (error) {
            console.error(`Ошибка при удалении видео ${id}:`, error);
            throw error;
        }
    }
};

// ===== СЕРВИС ДЛЯ РАБОТЫ С КОНТАКТАМИ =====
export const contactService = {
    // Получить контактную информацию (старая функция)
    get: async () => {
        const response = await api.get('/contacts');
        return response.data;
    },
    
    // Обновить контактную информацию (админ)
    update: async (contactData) => {
        const response = await api.put('/contacts', contactData);
        return response.data;
    },
    
    // ОТПРАВИТЬ ЗАЯВКУ (новая функция - используем эту в форме)
    sendMessage: async (formData) => {
        try {
            // Отправляем на новый endpoint
            const response = await api.post('/contacts/message', formData);
            
            if (!response.data.success) {
                throw new Error(response.data.error || 'Ошибка отправки');
            }
            
            return response.data;
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            
            // Пробрасываем сообщение об ошибке для отображения в форме
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            }
            throw new Error('Не удалось отправить сообщение. Попробуйте позже.');
        }
    },

    // Методы для работы с заявками (админ)
    getRequests: async () => {
        try {
            const response = await api.get('/contacts/requests');
            return response.data;
        } catch (error) {
            console.error('Ошибка загрузки заявок:', error);
            throw error;
        }
    },

    processRequest: async (id) => {
        try {
            const response = await api.put(`/contacts/requests/${id}/process`);
            return response.data;
        } catch (error) {
            console.error('Ошибка обработки заявки:', error);
            throw error;
        }
    },

    deleteRequest: async (id) => {
        try {
            const response = await api.delete(`/contacts/requests/${id}`);
            return response.data;
        } catch (error) {
            console.error('Ошибка удаления заявки:', error);
            throw error;
        }
    }
};

// ===== СЕРВИС ДЛЯ РАБОТЫ С ФОРУМОМ =====
export const forumService = {
    // Категории
    getCategories: async () => {
        try {
            const response = await api.get('/forum/categories');
            return response.data;
        } catch (error) {
            console.error('Ошибка при загрузке категорий форума:', error);
            throw error;
        }
    },

    getCategory: async (id) => {
        try {
            const response = await api.get(`/forum/categories/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка при загрузке категории ${id}:`, error);
            throw error;
        }
    },

    // Темы
    getTopics: async (page = 1, limit = 10, categoryId = null) => {
        try {
            let url = `/forum/topics?page=${page}&limit=${limit}`;
            if (categoryId) url += `&category_id=${categoryId}`;
            
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error('Ошибка при загрузке тем форума:', error);
            throw error;
        }
    },

    getTopic: async (id) => {
        try {
            const response = await api.get(`/forum/topics/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Ошибка при загрузке темы ${id}:`, error);
            throw error;
        }
    },

    createTopic: async (topicData) => {
        try {
            const response = await api.post('/forum/topics', topicData);
            return response.data;
        } catch (error) {
            console.error('Ошибка при создании темы:', error);
            throw error;
        }
    },

    // Сообщения
    getPosts: async (topicId, page = 1, limit = 20) => {
        try {
            const response = await api.get(
                `/forum/topics/${topicId}/posts?page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error) {
            console.error(`Ошибка при загрузке сообщений темы ${topicId}:`, error);
            throw error;
        }
    },

    createPost: async (topicId, postData) => {
        try {
            const response = await api.post(
                `/forum/topics/${topicId}/posts`,
                postData
            );
            return response.data;
        } catch (error) {
            console.error(`Ошибка при создании сообщения в теме ${topicId}:`, error);
            throw error;
        }
    },

    // Статистика
    getStats: async () => {
        try {
            const response = await api.get('/forum/stats');
            return response.data;
        } catch (error) {
            console.error('Ошибка при загрузке статистики форума:', error);
            throw error;
        }
    },

    getRecentActivity: async (limit = 10) => {
        try {
            const response = await api.get(`/forum/activity?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Ошибка при загрузке активности форума:', error);
            throw error;
        }
    },

    // Поиск
    search: async (query, page = 1, limit = 10) => {
        try {
            const response = await api.get(
                `/forum/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
            );
            return response.data;
        } catch (error) {
            console.error('Ошибка при поиске на форуме:', error);
            throw error;
        }
    },

    // Админ методы для форума
    approveTopic: async (topicId, token) => {
        try {
            const response = await api.post(
                `/forum/topics/${topicId}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error(`Ошибка при одобрении темы ${topicId}:`, error);
            throw error;
        }
    },

    deleteTopic: async (topicId, token) => {
        try {
            const response = await api.delete(
                `/forum/topics/${topicId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error(`Ошибка при удалении темы ${topicId}:`, error);
            throw error;
        }
    },

    deletePost: async (postId, token) => {
        try {
            const response = await api.delete(
                `/forum/posts/${postId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data;
        } catch (error) {
            console.error(`Ошибка при удалении сообщения ${postId}:`, error);
            throw error;
        }
    }
};

// Экспортируем экземпляр axios для прямых запросов
export default api;