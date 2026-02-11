import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Психолог Профессионал</h3>
            <p>
              Помогаю обрести гармонию, справиться со стрессом 
              и улучшить качество жизни через психологическую поддержку.
            </p>
          </div>
          
          <div className="footer-section">
            <h4>Быстрые ссылки</h4>
            <ul className="footer-links">
              <li><Link to="/">Главная</Link></li>
              <li><Link to="/articles">Статьи</Link></li>
              <li><Link to="/videos">Видео</Link></li>
              <li><Link to="/forum">Форум</Link></li>
              <li><Link to="/contacts">Контакты</Link></li>
              <li><Link to="/privacy-policy">Политика конфиденциальности</Link></li>
              <li><Link to="/forum-rules">Правила форума</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Контакты</h4>
            <div className="contact-info">
              <p>📞 +7 (911) 164-92-86</p>
              <p>✉️ plakhov83@mail.ru</p>
              <p>📍 г. Санкт - Петербург</p>
              <div className="social-links">
                <a href="https://t.me/surgeonvet04" target="_blank" rel="noopener noreferrer">Telegram</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Психолог Евгений Плахов. Все права защищены.</p>
          <p>Конфиденциальность и профессиональная этика гарантированы.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;  