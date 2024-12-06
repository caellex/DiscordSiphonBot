const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('what can this bot do?'),
     
async execute(interaction){
    await interaction.reply('Welcome to the Siphon bot!\nMade by Carl(github@caellex)\nThis bot is meant to make it a little bit easier for both Schwerte and all of us to keep track of our siphoned in the guild bank.\nFrom here you are able to request a deposit with a screenshot, and remove from your own balance. (try and do it when you withdraw, the logs will be looked over aswell.)')
}
    }
