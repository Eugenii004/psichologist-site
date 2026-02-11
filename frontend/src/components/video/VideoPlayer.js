// frontend/src/components/video/VideoPlayer.js
import React from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ video }) => {
  const getEmbedUrl = () => {
    switch(video.video_platform) {
      case 'youtube':
        return `https://www.youtube.com/embed/${video.video_id}?rel=0&showinfo=0`;
      case 'rutube':
        return `https://rutube.ru/play/embed/${video.video_id}?sTitle=false&sAuthor=false`;
      case 'vk':
        return `https://vk.com/video_ext.php?oid=-${video.video_id}`;
      case 'vimeo':
        return `https://player.vimeo.com/video/${video.video_id}`;
      default:
        return '';
    }
  };

  const embedUrl = getEmbedUrl();
  
  // Преобразуем tags в массив если нужно
  const getTagsArray = () => {
    if (!video.tags) return [];
    if (Array.isArray(video.tags)) return video.tags;
    if (typeof video.tags === 'string') {
      try {
        // Пытаемся распарсить JSON строку
        const parsed = JSON.parse(video.tags);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // Если не JSON, разбиваем по запятым
        return video.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }
    return [];
  };

  const tagsArray = getTagsArray();

  return (
    <div className="video-player-container">
      <div className="video-player">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="video-error">
            <p>Платформа видео не поддерживается</p>
          </div>
        )}
      </div>
      
      <div className="video-player-info">
        <h1>{video.title || 'Без названия'}</h1>
        <div className="video-stats">
          <span>👁️ {video.view_count || 0} просмотров</span>
          <span>📅 {video.created_at ? new Date(video.created_at).toLocaleDateString('ru-RU') : 'Нет даты'}</span>
          <span>🏷️ {video.category || 'Общее'}</span>
        </div>
        <p className="video-description">{video.description || 'Без описания'}</p>
        
        {tagsArray.length > 0 && (
          <div className="video-tags">
            {tagsArray.map((tag, index) => (
              <span key={index} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;