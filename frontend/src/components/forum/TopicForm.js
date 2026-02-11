import React, { useState } from 'react';
import './TopicForm.css';

const TopicForm = ({ categories = [], onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        author_name: '',
        author_email: '',
        consent: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.content || !formData.author_name) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        if (!formData.consent) {
            alert('Для создания темы необходимо дать согласие на обработку персональных данных');
            return;
        }

        onSubmit(formData);
    };

    return (
        <div className="topic-form">
            <h2>Создать новую тему</h2>
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">
                        Заголовок темы *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Введите заголовок темы"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category_id">
                        Категория
                    </label>
                    <select
                        id="category_id"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                    >
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="content">
                        Содержание *
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Опишите вашу тему подробнее..."
                        rows="8"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="author_name">
                        Ваше имя *
                    </label>
                    <input
                        type="text"
                        id="author_name"
                        name="author_name"
                        value={formData.author_name}
                        onChange={handleChange}
                        placeholder="Как к вам обращаться?"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="author_email">
                        Email (необязательно)
                    </label>
                    <input
                        type="email"
                        id="author_email"
                        name="author_email"
                        value={formData.author_email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                    />
                </div>

                <div className="form-group consent-group">
                    <div className="consent-checkbox">
                        <input
                            type="checkbox"
                            id="topic_consent"
                            name="consent"
                            checked={formData.consent}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="topic_consent" className="consent-label">
                            Я соглашаюсь на обработку моего имени, email и содержимого темы 
                            для публикации на форуме, принимаю{' '}
                            <a href="/forum-rules" target="_blank" rel="noopener noreferrer">
                                правила форума
                            </a>{' '}и даю согласие на обработку персональных данных 
                            в соответствии с{' '}
                            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                                Политикой конфиденциальности
                            </a>.*
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={onCancel}
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

                <p className="form-note">
                    * - обязательные поля. Тема будет опубликована после модерации.
                </p>
            </form>
        </div>
    );
};

export default TopicForm;