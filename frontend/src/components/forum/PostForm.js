import React, { useState } from 'react';
import './PostForm.css';

const PostForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        content: '',
        author_name: '',
        consent: false
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.content.trim() || !formData.author_name.trim()) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        if (formData.content.trim().length < 10) {
            alert('Сообщение должно содержать минимум 10 символов');
            return;
        }

        if (!formData.consent) {
            alert('Для публикации сообщения необходимо согласиться с правилами обработки данных');
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(formData);
            setFormData({
                content: '',
                author_name: '',
                consent: false
            });
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="post-form">
            <h3>Добавить ответ</h3>
            
            <form onSubmit={handleSubmit}>
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
                        disabled={submitting}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="content">
                        Ваш ответ *
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Напишите ваш ответ здесь..."
                        rows="6"
                        required
                        disabled={submitting}
                    />
                    <div className="char-counter">
                        {formData.content.length} символов
                    </div>
                </div>

                <div className="form-group consent-group">
                    <div className="consent-checkbox">
                        <input
                            type="checkbox"
                            id="post_consent"
                            name="consent"
                            checked={formData.consent}
                            onChange={handleChange}
                            required
                            disabled={submitting}
                        />
                        <label htmlFor="post_consent" className="consent-label">
                            Я соглашаюсь на обработку моего имени и сообщения в рамках 
                            публичного обсуждения на форуме, принимаю{' '}
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
                    {onCancel && (
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={onCancel}
                            disabled={submitting}
                        >
                            Отмена
                        </button>
                    )}
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={submitting}
                    >
                        {submitting ? 'Отправка...' : 'Отправить ответ'}
                    </button>
                </div>

                <p className="form-note">
                    * - обязательные поля. Ваш ответ появится после проверки модератором.
                </p>
            </form>
        </div>
    );
};

export default PostForm;