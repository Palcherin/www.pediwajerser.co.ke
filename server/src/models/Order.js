/**
 * Order Model
 * 
 * Represents customer orders
 * 
 * @module models/Order
 */

module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'SET NULL'
        },
        order_number: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            field: 'order_number'
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'total_amount',
            validate: {
                min: 0
            }
        },
        shipping_address: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'shipping_address'
        },
        shipping_city: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'shipping_city'
        },
        shipping_state: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'shipping_state'
        },
        shipping_zip: {
            type: DataTypes.STRING(20),
            allowNull: true,
            field: 'shipping_zip'
        },
        shipping_country: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'shipping_country'
        },
        payment_method: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'payment_method'
        },
        payment_status: {
            type: DataTypes.ENUM('pending', 'paid', 'failed'),
            defaultValue: 'pending',
            allowNull: false,
            field: 'payment_status'
        },
        order_status: {
            type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
            defaultValue: 'pending',
            allowNull: false,
            field: 'order_status'
        },
        tracking_number: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'tracking_number'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'orders',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['order_number'],
                unique: true
            },
            {
                fields: ['order_status']
            },
            {
                fields: ['payment_status']
            },
            {
                fields: ['created_at']
            }
        ]
    });

    return Order;
};