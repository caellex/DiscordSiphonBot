const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('What can this bot do?'),

    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('*Treasure Hunter Bot Help*')
            .setDescription('**Welcome to the Treasure Hunter bot!**\n\n')
            .addFields(
                { name: 'Purpose', value: 'This bot is meant to make it a little bit easier for both Schwerte and all of us to keep track of our siphoned in the guild bank.' },
                { name: 'Features', value: 'From here you are able to request a deposit with a screenshot, and remove from your own balance. (Try and do it when you withdraw, the logs will be looked over as well.)' },
                { name: 'Commands', value: 'You can see all commands by simply typing / and pressing the bot\'s profile pic.' },
                { name: 'Future', value: 'I will continue to seek out usecases for the bot, both for you regular guildies and higher ups. For one, this will make lootsplits a lot easier. I am also planning on adding "Weekly splits" where every split from that week is posted in its own channel on Sunday.' },
                { name: 'Questions/Ideas?', value: 'Feel free to message me if you have any suggestions or questions regarding the bot.' },
            ).setFooter({text: "*Made by Carl (github@caellex)*"})

        await interaction.reply({ embeds: [helpEmbed] });
    },
};
