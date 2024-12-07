const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getBalance } = require("../currency.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("energy")
    .setDescription("gives current siphoned energy balance")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get the balance of")
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const avatarURL = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });


    return await interaction.reply({
      content: ``,
      embeds: [
        new EmbedBuilder()
          .setTitle("Current Balance")
          .setAuthor({
            name: `${user.globalName}`,
            iconURL: `${avatarURL}`,
          })
          .setDescription(
            `\nAmount: ${getBalance(user.id)} <:SEnergy:1313155878928777267>`
          )
          .setColor("#ED4245")
          .setFooter({ text: "MADE BY @caellex" }),
      ],
    });
  },
};