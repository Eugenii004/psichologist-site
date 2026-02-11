import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <div className="logo">
                        <Link to="/">
                            <div className="logo-text">
                                <div className="logo-profession">Психолог</div>
                                <div className="logo-name">
                                    <span className="logo-firstname">Евгений</span>
                                    <span className="logo-lastname">Плахов</span>
                                </div>
                            </div>
                        </Link>
                        <p className="tagline">Помощь в достижении гармонии и баланса</p>
                    </div>

                    <nav className="nav">
                        <Link to="/" className="nav-link">Главная</Link>
                        <Link to="/articles" className="nav-link">Статьи</Link>
                        <Link to="/videos" className="nav-link">Видео</Link>
                        <Link to="/forum" className="nav-link">Форум</Link>
                        <Link to="/contacts" className="nav-link">Контакты</Link>
                        
                        {isAuthenticated && user?.role === 'admin' && (
                            <Link to="/admin" className="admin-link">
                                🔐 Админка
                            </Link>
                        )}
                    </nav>

                    <div className="header-actions">
                        {isAuthenticated ? (
                            <>
                                <span className="username">
                                    👤 {user?.username || 'Администратор'}
                                </span>
                                <button onClick={handleLogout} className="btn-logout">
                                    Выйти
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="btn-login">
                                🔐 Вход
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;