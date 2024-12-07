const { SlashCommandBuilder } = require("discord.js");

const { removeBalance, logRemoval } = require("../currency.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Removes amount from selected user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to remove the balance from")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount to remove")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");
    const commandUser = interaction.user.tag;

    if (!user) {
      return interaction.reply("Please try again, with a valid user selected.");
    }

    if (user.id !== interaction.user.id) {
      const hasRole = interaction.member.roles.cache.some(
        (role) =>
          role.name === "Admin" ||
          role.name === "Moderator" ||
          role.name === "Banker" ||
          role.name === "Developer"
      );
      if (!hasRole) {
        return interaction.reply(
          `You may only remove balance from yourself. If you have the banker role and are trying to remove someone's balance, something is very off.`
        );
      }
    }

    const updatedUser = await removeBalance(user.id, amount);
    await logRemoval(user.tag, amount, commandUser);
    console.log("Removed", {amount})

    if (!updatedUser) {
      return interaction.reply(
        "User does not have enough energy for this transaction."
      );
    }

    await interaction.reply(
      `${amount} siphoned energy removed from ${user.tag}.`
    );
  },
};
