import React, { useState } from 'react';
import './AdminPage.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('articles');

  return (
    <div className="admin-page">
      <div className="container">
        <h1>Панель управления</h1>
        
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            Статьи
          </button>
          <button 
            className={`tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            Видео
          </button>
          <button 
            className={`tab-btn ${activeTab === 'forum' ? 'active' : ''}`}
            onClick={() => setActiveTab('forum')}
          >
            Форум
          </button>
          <button 
            className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            Контакты
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'articles' && (
            <div className="tab-content">
              <h2>Управление статьями</h2>
              <button className="btn btn-primary">Добавить статью</button>
              <p>Здесь будет список статей для редактирования...</p>
            </div>
          )}
          
          {activeTab === 'videos' && (
            <div className="tab-content">
              <h2>Управление видео</h2>
              <button className="btn btn-primary">Добавить видео</button>
              <p>Здесь будет список видео для редактирования...</p>
            </div>
          )}
          
          {activeTab === 'contacts' && (
            <div className="tab-content">
              <h2>Редактирование контактов</h2>
              <p>Здесь можно изменить контактную информацию...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;