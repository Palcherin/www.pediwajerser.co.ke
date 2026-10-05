module.exports = (sequelize, DataTypes) => {
    const HeroSlide = sequelize.define('HeroSlide', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        image: { type: DataTypes.STRING(500), allowNull: false },
        tag: { type: DataTypes.STRING(60) },
        title: { type: DataTypes.STRING(150), allowNull: false },
        subtitle: { type: DataTypes.STRING(255) },
        cta: { type: DataTypes.STRING(60), defaultValue: 'Shop Now' },
        link: { type: DataTypes.STRING(255), defaultValue: '/' },
        accent: { type: DataTypes.STRING(9), defaultValue: '#4ade80' },
        bg_color: { type: DataTypes.STRING(9), defaultValue: '#111111' },
        sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
        is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
    }, {
        tableName: 'hero_slides',
        underscored: true,
        timestamps: true
    });

    return HeroSlide;
};