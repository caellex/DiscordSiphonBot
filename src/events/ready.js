const { Events, ActivityType } = require("discord.js");
const { initializeDatabase } = require("../dbInit");
const { populateCurrency } = require("../currency");
const { Users } = require("../models/Users");
module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    try {
      async function initializeBot() {
        await initializeDatabase(); 
        await populateCurrency(); 
      }
      await initializeBot();
      console.log(`Ready! Logged in as ${client.user.tag}`);

      client.user.setActivity({
        name: "Overcharging..",
        type: ActivityType.Custom,
      });
    } catch (e) {
      console.log("Error during initialization:", e);
    }
  },
};
