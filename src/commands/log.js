const { SlashCommandBuilder } = require("discord.js");
const { Removes } = require("../dbInit");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("logs")
    .setDescription(
      "Shows removal logs, used cross reference."
    )
    .addUserOption((option) => option
    .setName("user")
    .setDescription("Choose a user to only get logs for them. Just @ them.")
    .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    let logs;
    const hasRole = interaction.member.roles.cache.some(role => role.name === 'Admin' || role.name === 'Moderator' || role.name === 'Banker' || role.name === 'Developer');
    if(!hasRole)return interaction.reply(`You are not permitted to view logs. Please talk to a banker, Admin or Moderator.`)
    try {
      if (user) {
        logs = await Removes.findAll({ where: { takenFrom: user.tag } });
      } else {
        logs = await Removes.findAll();
      }

      if (logs.length === 0) {
        const noLogsMessage = user
          ? `No logs found for ${user.tag}.`
          : `No logs found.`;
        return interaction.reply(noLogsMessage);
      }

      const ConvertDate = (dateToFormat) => {
        if(dateToFormat){
            let latestDate = dateToFormat.split('T')[0];
            let tempTime = dateToFormat.split('T')[1];
            let latestTime = tempTime.split(/[+-.]/)[0];
    
            let time = latestDate + " " + latestTime;
            return time;
        }
      }

      const logsMessage = logs
        .map(
          (log) => `${log.takenFrom == log.takenBy ? `${ConvertDate(log.date)} | ${log.takenBy} removed ${log.amount} energy.` : `${ConvertDate(log.date)} | ${log.takenBy} removed ${log.amount} energy from ${log.takenFrom}.`}`
        )
        .join(`\n`);

        

        await interaction.reply(`\`\`\`\n${logsMessage}\n\`\`\``);
    } catch (error) {
      console.error("Error fetching logs:", error);
      await interaction.reply(
        "There was an error fetching the logs. Please try again later."
      );
    }
  },
};
