const {SlashCommandBuilder} = require('discord.js')
const { setBalance } = require("../currency");

module.exports = {
    data: new SlashCommandBuilder()
      .setName("set")
      .setDescription("Set's the balance account of the selected user. (OVERRIDES CURRENT BALANCE)")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user to set the balance of")
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription("The amount to set the balance to")
          .setRequired(true)
      ),
  
    async execute(interaction) {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");
      const hasRole = interaction.member.roles.cache.some(role => role.name === 'Admin' || role.name === 'Moderator' || role.name === 'Banker' || role.name === 'Developer');
  
      if (!user) {
        return interaction.reply("Please try again, with a valid user selected.");
      }
  
      if (user.id !== interaction.user.id) {
        if (hasRole) {
          return
        } else {
          return interaction.reply(`You may only remove balance from yourself. If you have the banker role and are trying to remove someone's balance, something is off.`);
        }
      }

      if(user.id == interaction.user.id && !hasRole){
        return interaction.reply(`Nice try, you didn't really think you would be able to set your own balance to whatever did you?`)
      }
  
      const updatedUser = await setBalance(user.id, amount);
  
      if (!updatedUser) {
        return interaction.reply(`User's balance was not set.. \nUser ID: ${user.id}.\nAmount:${amount}`);
      }
  
      await interaction.reply(`${user.tag}'s balance set to ${amount} siphoned energy.`);
    },
  };
  