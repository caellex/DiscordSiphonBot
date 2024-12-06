const { Client, IntentsBitField, Collection } = require("discord.js");
const path = require("node:path");
const fs = require("fs");
const { initializeDatabase } = require('./dbInit');
const { populateCurrency } = require('./currency');  

require("dotenv").config();



const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

  client.login(process.env.TOKEN);


client.commands = new Collection();

const commandPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandPath).filter((file) => file.endsWith('.js'));

for(const file of commandFiles){
    const filePath = path.join(commandPath, file)
    const command = require(filePath)
    client.commands.set(command.data.name, command)
}


const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}


process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await client.destroy(); // Closes WebSocket connection gracefully
    console.log('Bot logged off.');
    process.exit(0); // Ends the process
});



