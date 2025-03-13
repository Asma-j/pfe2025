const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('education', 'asma', '0000', {
    host: 'localhost',
    dialect: 'mssql',
    dialectOptions: {
        options: {
            encrypt: false,
            trustServerCertificate: true,
        },
    },
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connexion à la base de données réussie');
    } catch (error) {
        console.error('Erreur de connexion à la base de données :', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
