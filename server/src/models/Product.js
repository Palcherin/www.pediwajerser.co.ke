module.exports = (sequelize, DataTypes) => {
    const toNumber = (self, key) => {
        const v = self.getDataValue(key);
        return v === null || v === undefined ? null : parseFloat(v);
    };

    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: { notEmpty: true },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: { min: 0 },
            get() { return toNumber(this, 'price'); },
        },
        oldPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'old_price',
            validate: { min: 0 },
            get() { return toNumber(this, 'oldPrice'); },
        },
        discount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: { min: 0, max: 100 },
        },
        images: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: false,
            defaultValue: [],
        },
        sizes: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            allowNull: false,
            defaultValue: [],
        },
        categorySlug: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'category_slug',
        },
        brand: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        stockQuantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'stock_quantity',
        },
        inStock: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: 'in_stock',
        },
        featured: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'featured',
        },
    }, {
        tableName: 'products',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
        paranoid: false,
        indexes: [{ fields: ['category_slug'] }],
    });

    return Product;
};