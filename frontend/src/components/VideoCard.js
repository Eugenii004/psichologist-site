// frontend/src/components/VideoCard.js (добавьте ссылку на просмотр)
import React from 'react';
import { Link } from 'react-router-dom';
import './VideoCard.css';

const VideoCard = ({ video, isAdmin = false, onEdit, onDelete }) => {
  // Генерация превью
  const getThumbnail = () => {
    if (video.thumbnail_url) return video.thumbnail_url;
    
    switch(video.video_platform) {
      case 'rutube':
        return `https://pic.rutube.ru/video/${video.video_id}/screenshot.jpg`;
      case 'youtube':
        return `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`;
      default:
        return '/placeholder-video.jpg';
    }
  };

  // Платформа видео
  const getPlatformName = () => {
    switch(video.video_platform) {
      case 'rutube': return { name: 'RuTube', icon: '🇷🇺', color: '#4a76a8' };
      case 'youtube': return { name: 'YouTube', icon: '▶️', color: '#ff0000' };
      case 'vk': return { name: 'VK Видео', icon: '📱', color: '#4a76a8' };
      case 'vimeo': return { name: 'Vimeo', icon: '🎥', color: '#1ab7ea' };
      default: return { name: 'Видео', icon: '📹', color: '#6c757d' };
    }
  };

  const platform = getPlatformName();
  const thumbnail = getThumbnail();

  return (
    <div className="video-card">
      <div className="video-platform" style={{ backgroundColor: platform.color }}>
        <span className="platform-badge">
          {platform.icon} {platform.name}
        </span>
      </div>
      
      <Link to={`/videos/${video.id}`} className="video-thumbnail-link">
        <div className="video-thumbnail">
          <img src={thumbnail} alt={video.title} />
          <div className="video-duration">{video.duration || '00:00'}</div>
          <div className="play-overlay">▶</div>
        </div>
      </Link>
      
      <div className="video-info">
        <Link to={`/videos/${video.id}`} className="video-title-link">
          <h3 className="video-title">{video.title}</h3>
        </Link>
        
        <p className="video-description">{video.description || 'Без описания'}</p>
        
        <div className="video-meta">
          <span className="video-category">{video.category || 'Общее'}</span>
          <span className="video-views">👁️ {video.view_count || 0}</span>
          <span className="video-date">
            {video.created_at ? new Date(video.created_at).toLocaleDateString('ru-RU') : ''}
          </span>
        </div>
        
        {isAdmin && (
          <div className="admin-actions">
            <button onClick={() => onEdit(video)} className="btn-edit">✏️ Редактировать</button>
            <button onClick={() => onDelete(video)} className="btn-delete">🗑️ Удалить</button>
            {!video.is_published && <span className="draft-badge">Черновик</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCard;