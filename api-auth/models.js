const { DataTypes } = require('sequelize');
const { sequelize } = require('./database/connection');


// Usuario Base
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM,
        values: ['cliente', 'empresa'],
        allowNull: false,
        defaultValue: 'cliente'
    },
    profile_url: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ''
    }
}, {
    timestamps: true,
    tableName: 'usuarios'
});


// Cuenta Cliente
const Client = sequelize.define('Client', {
    date_birth: {
        type: DataTypes.DATE,
        allowNull: false
    },
    sex: {
        type: DataTypes.ENUM,
        values: ['male', 'female', 'other'],
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    }
}, {
    timestamps: false,
    tableName: 'clientes'
});


// Cuenta Empresa
const Company = sequelize.define('Company', {
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false
    },
    direction: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phones: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
    },
    genres: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    }
}, {
    timestamps: false,
    tableName: 'empresas'
});


// Un usuario puede ser un cliente
User.hasOne(Client, { foreignKey: 'user_id' });
Client.belongsTo(User, { foreignKey: 'user_id' });

// Un usuario puede ser una empresa
User.hasOne(Company, { foreignKey: 'user_id' });
Company.belongsTo(User, { foreignKey: 'user_id' });


module.exports = {
    User,
    Client,
    Company
};