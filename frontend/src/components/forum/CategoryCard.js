import React from 'react';
import './CategoryCard.css';

const CategoryCard = ({ category, onClick }) => {
    return (
        <div className="category-card" onClick={onClick}>
            <h3 className="category-name">{category.name}</h3>
            {category.description && (
                <p className="category-description">{category.description}</p>
            )}
            <div className="category-footer">
                <span className="category-topics">
                    {category.topic_count || 0} тем
                </span>
            </div>
        </div>
    );
};

export default CategoryCard;