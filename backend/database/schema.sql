-- Создайте файл backend/database/forum_tables.sql
-- Сначала удалим таблицы если они существуют
DROP TABLE IF EXISTS forum_posts;
DROP TABLE IF EXISTS forum_topics;
DROP TABLE IF EXISTS forum_categories;

-- Создаем таблицу категорий (БЕЗ slug если он не нужен)
CREATE TABLE forum_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forum_topics (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER REFERENCES forum_categories(id),
    author_id INTEGER,
    author_name VARCHAR(100),
    author_email VARCHAR(100),
    is_approved BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forum_posts (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES forum_topics(id),
    content TEXT NOT NULL,
    author_id INTEGER,
    author_name VARCHAR(100),
    author_email VARCHAR(100),
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставьте тестовые категории (БЕЗ slug)
INSERT INTO forum_categories (name, description) VALUES
('Общие вопросы', 'Обсуждение общих тем по психологии'),
('Стресс и тревога', 'Как справиться со стрессом и тревогой'),
('Отношения', 'Вопросы отношений и общения'),
('Самопомощь', 'Техники и практики самопомощи');

-- Вставьте тестовую тему
INSERT INTO forum_topics (title, content, category_id, author_name, author_email, is_approved) VALUES
('Как справиться с тревогой?', 'Подскажите эффективные методы борьбы с тревожностью...', 2, 'Анна', 'anna@example.com', true),
('Проблемы в отношениях', 'Не могу найти общий язык с партнером...', 3, 'Сергей', 'sergey@example.com', false);

-- Вставьте тестовые сообщения
INSERT INTO forum_posts (topic_id, content, author_name, author_email, is_approved) VALUES
(1, 'Попробуйте дыхательные упражнения, они хорошо помогают.', 'Психолог', 'psychologist@example.com', true),
(1, 'Спасибо за совет! Попробую.', 'Анна', 'anna@example.com', true),
(2, 'Нужно больше информации о вашей ситуации.', 'Психолог', 'psychologist@example.com', true);