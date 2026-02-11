// frontend/src/pages/ForumPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ForumPage.css';

const ForumPage = () => {
    const [categories, setCategories] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showNewTopicForm, setShowNewTopicForm] = useState(false);
    
    const [newTopic, setNewTopic] = useState({
        title: '',
        content: '',
        category_id: '',
        author_name: '',
        author_email: '',
        consent_processing: false,
        consent_read: false
    });

    // Загрузка данных форума
    const loadForumData = async () => {
        try {
            console.log('🔄 Начинаю загрузку данных форума...');
            setLoading(true);
            
            // 1. Загружаем категории
            console.log('📦 Запрашиваю категории...');
            const categoriesResponse = await fetch('http://localhost:5000/api/forum/categories');
            if (!categoriesResponse.ok) {
                throw new Error(`Ошибка категорий: ${categoriesResponse.status}`);
            }
            const categoriesData = await categoriesResponse.json();
            console.log('✅ Категории получены:', categoriesData);
            setCategories(categoriesData);
            
            // 2. Загружаем темы
            console.log('📦 Запрашиваю темы...');
            const topicsResponse = await fetch('http://localhost:5000/api/forum/topics');
            if (!topicsResponse.ok) {
                throw new Error(`Ошибка тем: ${topicsResponse.status}`);
            }
            const topicsData = await topicsResponse.json();
            console.log('✅ Темы получены:', topicsData);
            setTopics(topicsData);
            
        } catch (error) {
            console.error('❌ Ошибка загрузки форума:', error);
            alert('Не удалось загрузить форум. Проверьте консоль.');
        } finally {
            setLoading(false);
        }
    };

    // Загрузка при монтировании
    useEffect(() => {
        loadForumData();
    }, []);

    // Фильтрация тем по категории
    const filteredTopics = selectedCategory 
        ? topics.filter(topic => topic.category_id === selectedCategory)
        : topics;

    // Обработчик изменения формы
    const handleNewTopicChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewTopic(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Создание новой темы
    const handleCreateTopic = async (e) => {
        e.preventDefault();
        
        // Проверяем оба чекбокса
        if (!newTopic.consent_processing) {
            alert('Для создания темы необходимо дать согласие на обработку персональных данных');
            return;
        }
        
        if (!newTopic.consent_read) {
            alert('Для создания темы необходимо подтвердить ознакомление с Политикой обработки персональных данных');
            return;
        }
        
        try {
            console.log('📝 Отправляю новую тему:', newTopic);
            
            const response = await fetch('http://localhost:5000/api/forum/topics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newTopic,
                    consent: newTopic.consent_processing, // для обратной совместимости
                    consent_read: newTopic.consent_read
                })
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка создания: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Тема создана:', result);
            
            alert('Тема создана! После модерации она появится на форуме.');
            setShowNewTopicForm(false);
            setNewTopic({
                title: '',
                content: '',
                category_id: '',
                author_name: '',
                author_email: '',
                consent_processing: false,
                consent_read: false
            });
            
            // Перезагружаем данные
            setTimeout(() => loadForumData(), 1000);
            
        } catch (error) {
            console.error('❌ Ошибка создания темы:', error);
            alert('Не удалось создать тему: ' + error.message);
        }
    };

    // Если загрузка
    if (loading) {
        return (
            <div className="container">
                <div className="loading">
                    <h2>Загрузка форума...</h2>
                    <p>Пожалуйста, подождите</p>
                </div>
            </div>
        );
    }

    return (
        <div className="forum-page">
            <div className="container">
                {/* Шапка форума */}
                <div className="forum-header">
                    <h1>Форум психологической поддержки</h1>
                    <p>Задавайте вопросы, делитесь опытом, получайте поддержку</p>
                    <div className="forum-stats">
                        <span>Тем: {topics.length}</span>
                        <span>Категорий: {categories.length}</span>
                    </div>
                </div>

                <div className="forum-layout">
                    {/* Боковая панель - категории */}
                    <div className="forum-sidebar">
                        <div className="sidebar-section">
                            <h3>Категории</h3>
                            <div className="categories-list">
                                <button 
                                    className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    <span className="category-name">Все темы</span>
                                    <span className="topic-count">({topics.length})</span>
                                </button>
                                
                                {categories.map(category => {
                                    const categoryTopics = topics.filter(t => t.category_id === category.id);
                                    return (
                                        <button
                                            key={category.id}
                                            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(category.id)}
                                        >
                                            <span className="category-name">{category.name}</span>
                                            <span className="category-desc">{category.description}</span>
                                            <span className="topic-count">({categoryTopics.length})</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="sidebar-section">
                            <h3>Действия</h3>
                            <button 
                                className="btn btn-primary btn-block"
                                onClick={() => setShowNewTopicForm(true)}
                            >
                                + Создать тему
                            </button>
                        </div>
                    </div>

                    {/* Основная часть - темы или форма */}
                    <div className="forum-main">
                        {showNewTopicForm ? (
                            // Форма создания темы
                            <div className="new-topic-form">
                                <div className="form-header">
                                    <h2>Новая тема для обсуждения</h2>
                                    <button 
                                        className="btn btn-text"
                                        onClick={() => setShowNewTopicForm(false)}
                                    >
                                        ← Назад к темам
                                    </button>
                                </div>
                                
                                <form onSubmit={handleCreateTopic}>
                                    <div className="form-group">
                                        <label htmlFor="title">Заголовок *</label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={newTopic.title}
                                            onChange={handleNewTopicChange}
                                            placeholder="Краткий заголовок вашего вопроса"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="category_id">Категория *</label>
                                        <select
                                            id="category_id"
                                            name="category_id"
                                            value={newTopic.category_id}
                                            onChange={handleNewTopicChange}
                                            required
                                        >
                                            <option value="">Выберите категорию</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="author_name">Ваше имя *</label>
                                            <input
                                                type="text"
                                                id="author_name"
                                                name="author_name"
                                                value={newTopic.author_name}
                                                onChange={handleNewTopicChange}
                                                placeholder="Как к вам обращаться?"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="author_email">Email</label>
                                            <input
                                                type="email"
                                                id="author_email"
                                                name="author_email"
                                                value={newTopic.author_email}
                                                onChange={handleNewTopicChange}
                                                placeholder="Для ответа (необязательно)"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="content">Содержание *</label>
                                        <textarea
                                            id="content"
                                            name="content"
                                            value={newTopic.content}
                                            onChange={handleNewTopicChange}
                                            placeholder="Подробно опишите ваш вопрос или ситуацию. Чем больше деталей, тем лучше..."
                                            rows="8"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group consent-group">
                                        <div className="consent-checkbox">
                                            <input
                                                type="checkbox"
                                                id="consent_processing"
                                                name="consent_processing"
                                                checked={newTopic.consent_processing}
                                                onChange={handleNewTopicChange}
                                                required
                                            />
                                            <label htmlFor="consent_processing">
                                                Я даю согласие на обработку моих персональных данных 
                                                (имени, email) для публикации на форуме*
                                            </label>
                                        </div>
                                        
                                        <div className="consent-checkbox">
                                            <input
                                                type="checkbox"
                                                id="consent_read"
                                                name="consent_read"
                                                checked={newTopic.consent_read}
                                                onChange={handleNewTopicChange}
                                                required
                                            />
                                            <label htmlFor="consent_read">
                                                Я подтверждаю, что ознакомился(ась) с{' '}
                                                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                                                    Политикой обработки персональных данных
                                                </a>{' '}
                                                форума*
                                            </label>
                                        </div>
                                        
                                        <p className="consent-note">
                                            * Оба поля обязательны для создания темы
                                        </p>
                                    </div>
                                    
                                    <div className="form-actions">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setShowNewTopicForm(false)}
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                        >
                                            Создать тему
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            // Список тем
                            <>
                                <div className="topics-header">
                                    <div>
                                        <h2>
                                            {selectedCategory 
                                                ? categories.find(c => c.id === selectedCategory)?.name 
                                                : 'Все темы'}
                                        </h2>
                                        <p className="topics-count">
                                            {filteredTopics.length} {filteredTopics.length === 1 ? 'тема' : 
                                            filteredTopics.length >= 2 && filteredTopics.length <= 4 ? 'темы' : 'тем'}
                                        </p>
                                    </div>
                                    
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => setShowNewTopicForm(true)}
                                    >
                                        + Новая тема
                                    </button>
                                </div>
                                
                                {filteredTopics.length === 0 ? (
                                    <div className="no-topics">
                                        <div className="no-topics-icon">💬</div>
                                        <h3>Пока нет тем</h3>
                                        <p>
                                            {selectedCategory 
                                                ? `В категории "${categories.find(c => c.id === selectedCategory)?.name}" еще нет тем`
                                                : 'На форуме пока нет созданных тем'}
                                        </p>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => setShowNewTopicForm(true)}
                                        >
                                            Создать первую тему
                                        </button>
                                    </div>
                                ) : (
                                    <div className="topics-list">
                                        {filteredTopics.map(topic => (
                                            <div key={topic.id} className="topic-card">
                                                <div className="topic-header">
                                                    <div className="topic-title-section">
                                                        <h3>
                                                            <Link to={`/forum/topics/${topic.id}`} className="topic-link">
                                                                {topic.title}
                                                            </Link>
                                                        </h3>
                                                        <div className="topic-meta">
                                                            <span className="author">
                                                                👤 {topic.author_name || 'Аноним'}
                                                            </span>
                                                            <span className="category">
                                                                📁 {topic.category_name || 'Без категории'}
                                                            </span>
                                                            <span className="date">
                                                                📅 {new Date(topic.created_at).toLocaleDateString('ru-RU')}
                                                            </span>
                                                            <span className="views">
                                                                👁️ {topic.views || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="topic-content">
                                                    <p>
                                                        {topic.content.length > 200 
                                                            ? topic.content.substring(0, 200) + '...' 
                                                            : topic.content}
                                                    </p>
                                                </div>
                                                
                                                <div className="topic-footer">
                                                    <Link 
                                                        to={`/forum/topics/${topic.id}`} 
                                                        className="btn btn-outline"
                                                    >
                                                        Читать полностью →
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForumPage;