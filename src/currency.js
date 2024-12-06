const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const { sequelize, Users, Removes } = require('./dbInit'); 
const currency = new Collection();

async function populateCurrency() {
    try {
      const users = await Users.findAll();
      users.forEach(user => {
        currency.set(user.user_id, user);
      });
    } catch (error) {
      console.error('Error populating currency:', error);
    }
}

async function addBalance(id, amount) {
  let user = currency.get(id);

  if (user) {
    user.balance += Number(amount);
    await user.save(); 
    return user;
  }

  user = await Users.create({ user_id: id, balance: amount });
  currency.set(id, user);
  return user;
}

async function logRemoval(takenfrom, amount, takenby){ 
const date = new Date().toISOString();
try{
await Removes.create({takenFrom: takenfrom, amount: amount, date: date, takenBy: takenby})
} catch(e){console.log("error:",e)}
}

async function removeBalance(id, amount) {
  let user = currency.get(id);

  if (!user || user.balance < Number(amount)) {
    return false; 
  }
  
  user.balance -= Number(amount);
  await user.save();
  return user;
}

async function setBalance(id, amount) {
	let user = currency.get(id);
  
	if (!user) {
	  return false; 
	}
	
	user.balance = Number(amount);
	await user.save();
	return user;
  }

function getBalance(id) {
  const user = currency.get(id);
  return user ? user.balance : 0;
}

module.exports = { addBalance, getBalance, populateCurrency, removeBalance, setBalance, logRemoval };
