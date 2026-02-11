import React from 'react';
import './PostCard.css';

const PostCard = ({ post }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="post-card">
            <div className="post-header">
                <div className="post-author">
                    <span className="author-avatar">👤</span>
                    <div className="author-info">
                        <span className="author-name">{post.author_name}</span>
                        <span className="post-date">{formatDate(post.created_at)}</span>
                    </div>
                </div>
            </div>
            
            <div className="post-content">
                {post.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>
        </div>
    );
};

export default PostCard;