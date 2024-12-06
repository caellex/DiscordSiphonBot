const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
	return sequelize.define('removes', {
		id: {
            type: DataTypes.INTEGER,
			primaryKey: true,
        },
        takenBy: {
			type: DataTypes.STRING,
			primaryKey: false,
		},
        takenFrom: {
			type: DataTypes.STRING,
			primaryKey: false,
		},
		amount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
        date: {
			type: DataTypes.TEXT,
			defaultValue: "",
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};


