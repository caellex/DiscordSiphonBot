const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("node:path");
require('dotenv').config({ path: path.resolve('/home/ubuntu/nudd/Mowgli/DiscordSiphonBot/.env') });

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

rest.get(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
  )
  .then((commands) => {
    const promises = commands.map((command) =>
      rest.delete(
        Routes.applicationGuildCommand(
          process.env.CLIENT_ID,
          process.env.GUILD_ID,
          command.id
        )
      )
    );
    return Promise.all(promises);
  })
  .then(() => console.log("Successfully deleted all guild commands."))
  .catch(console.error);

rest.get(Routes.applicationCommands(process.env.CLIENT_ID))
  .then((commands) => {
    const promises = commands.map((command) =>
      rest.delete(Routes.applicationCommand(process.env.CLIENT_ID, command.id))
    );
    return Promise.all(promises);
  })
  .then(() => console.log("Successfully deleted all global commands."))
  .catch(console.error);
