import React from 'react';
import { Link } from 'react-router-dom'; // ← УБЕДИТЕСЬ ЧТО ЭТОТ ИМПОРТ ЕСТЬ
import './TopicCard.css';

const TopicCard = ({ topic }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="topic-card">
            <div className="topic-main">
                <div className="topic-title-section">
                    <h3 className="topic-title">
                        <Link to={`/forum/topics/${topic.id}`}> {/* ← ИЗМЕНИЛИ ССЫЛКУ */}
                            {topic.title}
                        </Link>
                    </h3>
                    <div className="topic-meta">
                        <span className="topic-author">
                            👤 {topic.author_name}
                        </span>
                        <span className="topic-date">
                            📅 {formatDate(topic.created_at)}
                        </span>
                        {topic.category_name && (
                            <span className="topic-category">
                                #{topic.category_name}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="topic-stats">
                    <div className="stat">
                        <span className="stat-number">{topic.post_count || 0}</span>
                        <span className="stat-label">сообщений</span>
                    </div>
                    {topic.last_activity && (
                        <div className="stat">
                            <span className="stat-label">
                                Последняя активность:
                            </span>
                            <span className="stat-date">
                                {formatDate(topic.last_activity)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopicCard;