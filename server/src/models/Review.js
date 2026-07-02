/**
 * Review Model
 * 
 * Represents product reviews and ratings
 * 
 * @module models/Review
 */

module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define('Review', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'reviews',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        underscored: true,
        indexes: [
            {
                fields: ['user_id', 'product_id'],
                unique: true
            },
            {
                fields: ['product_id']
            },
            {
                fields: ['user_id']
            },
            {
                fields: ['rating']
            }
        ]
    });

    return Review;
};