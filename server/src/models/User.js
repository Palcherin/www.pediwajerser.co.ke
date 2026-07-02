/**
 * User Model
 * 
 * Represents users in the system
 * 
 * @module models/User
 */

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'password_hash'
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'first_name'
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'last_name'
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        state: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        zip_code: {
            type: DataTypes.STRING(20),
            allowNull: true,
            field: 'zip_code'
        },
        country: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user',
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
            field: 'is_active'
        }
    }, {
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true, // Soft delete
        deletedAt: 'deleted_at',
        underscored: true,
        indexes: [
            {
                fields: ['email'],
                unique: true
            },
            {
                fields: ['role']
            },
            {
                fields: ['is_active']
            }
        ]
    });

    return User;
};