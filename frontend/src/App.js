// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Публичные страницы
import HomePage from './pages/HomePage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import VideosPage from './pages/VideosPage';
import VideoDetailPage from './pages/VideoDetailPage';
import ForumPage from './pages/ForumPage';
import TopicDetailPage from './pages/TopicDetailPage';
import ContactsPage from './pages/ContactsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import LoginPage from './pages/admin/LoginPage';

// Админские страницы
import DashboardPage from './pages/admin/DashboardPage';
import ArticlesPageAdmin from './pages/admin/ArticlesPageAdmin';
import ArticleFormPage from './pages/admin/ArticleFormPage';
import VideosPageAdmin from './pages/admin/VideosPageAdmin';
import VideoFormPage from './pages/admin/VideoFormPage';
import ForumModerationPage from './pages/admin/ForumModerationPage';
import ForumAdminPage from './pages/admin/ForumAdminPage'; // ← Добавьте эту страницу
import ContactRequestsPage from './pages/admin/ContactRequestsPage';

// Компоненты
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              {/* ===== ГЛАВНАЯ СТРАНИЦА ===== */}
              <Route path="/" element={<HomePage />} />
              
              {/* ===== ПУБЛИЧНЫЕ РОУТЫ ===== */}
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/articles/:id" element={<ArticleDetailPage />} />
              <Route path="/videos" element={<VideosPage />} />
              <Route path="/videos/:id" element={<VideoDetailPage />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/forum/topics/:id" element={<TopicDetailPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* ===== АДМИНСКИЕ РОУТЫ ===== */}
              <Route path="/admin" element={<PrivateRoute />}>
                {/* /admin перенаправляет на /admin/dashboard */}
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                
                {/* Форум */}
                <Route path="forum/moderate" element={<ForumModerationPage />} />
                <Route path="forum/manage" element={<ForumAdminPage />} /> {/* ← Новая страница */}
                
                {/* Контакты */}
                <Route path="contact-requests" element={<ContactRequestsPage />} />
                
                {/* Статьи */}
                <Route path="articles" element={<ArticlesPageAdmin />} />
                <Route path="articles/new" element={<ArticleFormPage />} />
                <Route path="articles/edit/:id" element={<ArticleFormPage />} />
                
                {/* Видео */}
                <Route path="videos" element={<VideosPageAdmin />} />
                <Route path="videos/new" element={<VideoFormPage />} />
                <Route path="videos/edit/:id" element={<VideoFormPage />} />
              </Route>
              
              {/* ===== 404 ===== */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;