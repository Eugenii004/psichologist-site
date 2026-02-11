// frontend/src/pages/ContactsPage.js
import React, { useState, useEffect } from 'react';
import { contactService } from '../services/api';
import './ContactsPage.css';

const ContactsPage = () => {
  const [contacts, setContacts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    consent_processing: false,
    consent_read: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setContacts({
          email: 'plakhov83@mail.ru',
          phone: '+7 (911) 164-92-86',
          address: 'г. Санкт - Петербург',
          schedule: 'Пн-Пт: 10:00 - 20:00, Сб: 11:00 - 16:00'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({
        type: 'error',
        message: 'Пожалуйста, заполните все обязательные поля'
      });
      return;
    }

    // ВАЖНО: Проверяем ОБА чекбокса
    if (!formData.consent_processing) {
      setSubmitStatus({
        type: 'error',
        message: 'Для отправки сообщения необходимо дать согласие на обработку персональных данных'
      });
      return;
    }

    if (!formData.consent_read) {
      setSubmitStatus({
        type: 'error',
        message: 'Для отправки сообщения необходимо подтвердить ознакомление с Политикой обработки персональных данных'
      });
      return;
    }

    setSubmitting(true);
    setSubmitStatus(null);

    try {
      // Отправляем оба значения согласия
      await contactService.sendMessage({
        ...formData,
        consent_processing: formData.consent_processing,
        consent_read: formData.consent_read
      });
      
      setSubmitStatus({
        type: 'success',
        message: 'Сообщение отправлено! Я свяжусь с вами в ближайшее время.'
      });
      
      // Сбрасываем форму
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        consent_processing: false,
        consent_read: false
      });
      
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Не удалось отправить сообщение. Пожалуйста, попробуйте позже.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container text-center">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="contacts-page">
      <div className="container">
        <div className="page-header">
          <h1>Контакты и запись</h1>
          <p className="page-subtitle">
            Свяжитесь со мной для консультации или задайте вопрос
          </p>
        </div>

        <div className="contacts-grid">
          <div className="contacts-info">
            <div className="info-card">
              <h2>Контактная информация</h2>
              
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div>
                  <h3>Телефон</h3>
                  <p>{contacts.phone}</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <div>
                  <h3>Email</h3>
                  <p>{contacts.email}</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div>
                  <h3>Адрес</h3>
                  <p>{contacts.address}</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon">⏰</span>
                <div>
                  <h3>График работы</h3>
                  <p>{contacts.schedule}</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon">💬</span>
                <div>
                  <h3>Социальные сети</h3>
                  <div className="social-links">
                    <a href="https://t.me/surgeonvet04" target="_blank" rel="noopener noreferrer">Telegram</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <div className="form-card">
              <h2>Напишите мне</h2>
              <p>Заполните форму, и я свяжусь с вами в ближайшее время</p>

              {submitStatus && (
                <div className={`alert alert-${submitStatus.type}`}>
                  {submitStatus.message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">
                    Имя <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ваше имя"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Телефон</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+7 (911) 164-92-86"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">
                    Сообщение <span className="required">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Опишите ваш вопрос или желаемое время консультации..."
                    rows="5"
                    required
                  ></textarea>
                </div>

                <div className="form-group consent-group">
                  <div className="consent-checkbox">
                    <input
                      type="checkbox"
                      id="consent_processing"
                      name="consent_processing"
                      checked={formData.consent_processing}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="consent_processing" className="consent-label">
                      Я даю согласие на обработку моих персональных данных 
                      (имени, email и номера телефона) для связи со мной и 
                      предоставления психологической консультации*
                    </label>
                  </div>
                  
                  <div className="consent-checkbox">
                    <input
                      type="checkbox"
                      id="consent_read"
                      name="consent_read"
                      checked={formData.consent_read}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="consent_read" className="consent-label">
                      Я подтверждаю, что ознакомился(ась) с{' '}
                      <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                        Политикой обработки персональных данных
                      </a>{' '}
                      и понимаю порядок обработки моих данных*
                    </label>
                  </div>
                  
                  <p className="consent-note">
                    * Оба поля обязательны для отправки сообщения
                  </p>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Отправка...' : 'Отправить сообщение'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="consultation-info">
          <h3>Как проходит консультация?</h3>
          <div className="consultation-steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>Запись</h4>
              <p>Оставьте заявку через форму или позвоните</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Подтверждение</h4>
              <p>Я свяжусь с вами для уточнения деталей</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Консультация</h4>
              <p>Встречаемся онлайн в удобное время</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;