import React, { useState, useEffect } from 'react';
import { contactService } from '../../services/api';
import './ContactRequestsPage.css';

const ContactRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const response = await contactService.getRequests();
            setRequests(response.requests || []);
        } catch (error) {
            console.error('Ошибка загрузки заявок:', error);
            setError('Не удалось загрузить заявки');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessRequest = async (id) => {
        if (!window.confirm('Отметить заявку как обработанную?')) return;
        
        try {
            await contactService.processRequest(id);
            setRequests(prev => prev.map(req => 
                req.id === id ? { ...req, is_processed: true, processed_at: new Date().toISOString() } : req
            ));
            alert('✅ Заявка отмечена как обработанная');
        } catch (error) {
            console.error('Ошибка обработки:', error);
            alert('❌ Не удалось обработать заявку');
        }
    };

    const handleDeleteRequest = async (id) => {
        if (!window.confirm('Удалить эту заявку?')) return;
        
        try {
            await contactService.deleteRequest(id);
            setRequests(prev => prev.filter(req => req.id !== id));
            alert('✅ Заявка удалена');
        } catch (error) {
            console.error('Ошибка удаления:', error);
            alert('❌ Не удалось удалить заявку');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleString('ru-RU');
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Загрузка заявок...</div>
            </div>
        );
    }

    return (
        <div className="contact-requests-page">
            <div className="container">
                <div className="page-header">
                    <h1>📋 Заявки на консультацию</h1>
                    <p>Всего заявок: <strong>{requests.length}</strong></p>
                </div>

                {error && (
                    <div className="alert alert-error">{error}</div>
                )}

                {requests.length === 0 ? (
                    <div className="no-data">
                        <p>Заявок пока нет</p>
                    </div>
                ) : (
                    <div className="requests-table-container">
                        <table className="requests-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Имя</th>
                                    <th>Email / Телефон</th>
                                    <th>Сообщение</th>
                                    <th>Согласие</th>
                                    <th>Дата</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(request => (
                                    <tr key={request.id} className={request.is_processed ? 'processed' : 'new'}>
                                        <td className="request-id">#{request.id}</td>
                                        <td className="request-name">
                                            <strong>{request.name}</strong>
                                        </td>
                                        <td className="request-contact">
                                            <div>{request.email}</div>
                                            {request.phone && (
                                                <div className="phone">📞 {request.phone}</div>
                                            )}
                                        </td>
                                        <td className="request-message">
                                            {request.message.length > 100 
                                                ? `${request.message.substring(0, 100)}...`
                                                : request.message}
                                        </td>
                                        <td className="request-consent">
                                            {request.consent_given ? (
                                                <span className="consent-yes">✅ Да</span>
                                            ) : (
                                                <span className="consent-no">❌ Нет</span>
                                            )}
                                            {request.consent_timestamp && (
                                                <div className="consent-date">
                                                    {formatDate(request.consent_timestamp)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="request-date">
                                            {formatDate(request.created_at)}
                                        </td>
                                        <td className="request-status">
                                            {request.is_processed ? (
                                                <span className="status-processed">
                                                    ✅ Обработано
                                                    {request.processed_at && (
                                                        <div>{formatDate(request.processed_at)}</div>
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="status-new">🆕 Новое</span>
                                            )}
                                        </td>
                                        <td className="request-actions">
                                            {!request.is_processed && (
                                                <button
                                                    className="btn btn-success btn-small"
                                                    onClick={() => handleProcessRequest(request.id)}
                                                >
                                                    ✅ Обработать
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-danger btn-small"
                                                onClick={() => handleDeleteRequest(request.id)}
                                            >
                                                🗑️ Удалить
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="stats-card">
                    <h3>📊 Статистика</h3>
                    <div className="stats-grid">
                        <div className="stat">
                            <span className="stat-value">{requests.length}</span>
                            <span className="stat-label">Всего заявок</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">
                                {requests.filter(r => !r.is_processed).length}
                            </span>
                            <span className="stat-label">Новых</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">
                                {requests.filter(r => r.consent_given).length}
                            </span>
                            <span className="stat-label">С согласием</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">
                                {requests.filter(r => r.phone).length}
                            </span>
                            <span className="stat-label">С телефоном</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactRequestsPage;