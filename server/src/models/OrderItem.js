/**
 * Order Item Model
 * 
 * Represents items within an order
 * 
 * @module models/OrderItem
 */

module.exports = (sequelize, DataTypes) => {
    const OrderItem = sequelize.define('OrderItem', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'orders',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'products',
                key: 'id'
            },
            onDelete: 'SET NULL'
        },
        product_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'product_name'
        },
        product_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'product_price',
            validate: {
                min: 0
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
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
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'total_price',
            validate: {
                min: 0
            }
        }
    }, {
        tableName: 'order_items',
        timestamps: false,
        underscored: true,
        indexes: [
            {
                fields: ['order_id']
            },
            {
                fields: ['product_id']
            }
        ]
    });

    return OrderItem;
};