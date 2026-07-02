/**
 * Cart Model
 * 
 * Represents shopping cart items
 * 
 * @module models/Cart
 */

module.exports = (sequelize, DataTypes) => {
    const Cart = sequelize.define('Cart', {
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
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
            validate: {
                min: 1
            }
        },
        size: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        color: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        added_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'added_at'
        }
    }, {
        tableName: 'cart',
        timestamps: false,
        underscored: true,
        indexes: [
            {
                fields: ['user_id', 'product_id', 'size', 'color'],
                unique: true
            },
            {
                fields: ['user_id']
            },
            {
                fields: ['product_id']
            }
        ]
    });

    return Cart;
};