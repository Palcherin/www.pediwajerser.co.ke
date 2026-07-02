/**
 * Product Model
 * 
 * Represents jerseys/products in the store
 * 
 * @module models/Product
 */

module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        discount_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'discount_price',
            validate: {
                min: 0
            }
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        brand: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        size: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        color: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        material: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        stock_quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            field: 'stock_quantity',
            validate: {
                min: 0
            }
        },
        images: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: [],
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
            field: 'is_active'
        }
    }, {
        tableName: 'products',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true,
        deletedAt: 'deleted_at',
        underscored: true,
        indexes: [
            {
                fields: ['category']
            },
            {
                fields: ['brand']
            },
            {
                fields: ['is_active']
            },
            {
                fields: ['price']
            }
        ]
    });

    return Product;
};