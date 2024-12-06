const { SlashCommandBuilder } = require('discord.js')
const { getBalance } = require('../currency.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('gives current siphoned energy balance')
    .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user to set the balance of")
          .setRequired(false)
      ),
    
     
async execute(interaction){
    const user = interaction.options.getUser("user");

    if(!user){
        return await interaction.reply(`${interaction.user.tag}'s balance is currently ${getBalance(interaction.user.id)} siphoned energy.`)
    } else {
        await interaction.reply(`${user.tag}'s balance is currently ${getBalance(user.id)} siphoned energy.`)
    }
    
}
    }
