const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '~/energy-bot',
  logging: false,
});

const Users = require('./models/Users.js')(sequelize);
const Removes = require('./models/Removes.js')(sequelize)

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync();
    console.log('Database synchronized');
  } catch (err) {
    console.error('Error syncing database:', err);
    process.exit(1);
  }
}

module.exports = { initializeDatabase, sequelize, Users, Removes };