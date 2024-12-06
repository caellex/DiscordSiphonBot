const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
    ChannelType,
    awaitMessageComponent,
    AttachmentBuilder,
  } = require("discord.js");
  
  const { addBalance, getBalance } = require("../currency.js");
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("deposit")
      .setDescription(
        "Sends a deposit request to guild management, requires a screenshot of the deposit."
      )
      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription("The amount you deposited ingame")
          .setRequired(true)
      ),
  
    async execute(interaction) {
      const userDefinedValue = interaction.options.getInteger("amount");
      const requestId = `${interaction.user.id}-${Date.now()}`;
      await interaction.reply({
        content: `You are trying to deposit ${userDefinedValue} siphoned energy, please provide a screenshot of the deposit in Albion. \n\nThis can be done by going to the guild tab, then accessing the 3rd tab down, and sorting by siphoned energy. Please include the date, amount, and username.`,
      });
  
      const filter = (message) =>
        message.author.id === interaction.user.id && message.attachments.size > 0;
      const channel = interaction.channel;
      const user = interaction.user.tag;
  
      const collectScreenshot = async () => {
        try {
          const collected = await channel.awaitMessages({ filter, max: 1, time: 60000, errors: ["time"] });
          const userMessage = collected.first();
          const screenshotUrl = userMessage.attachments.first().url;
  
          await userMessage.delete();
  
          await interaction.editReply({
            content: `<@${interaction.user.id}>\nThanks for providing the screenshot. \nYour deposit will be looked at within 24 hours.`,
          });
  
          const confirm = new ButtonBuilder()
            .setCustomId(`confirm-${requestId}`)
            .setLabel("Confirm Deposit")
            .setStyle(ButtonStyle.Success);
  
          const cancel = new ButtonBuilder()
            .setCustomId(`cancel-${requestId}`)
            .setLabel("Deny Deposit")
            .setStyle(ButtonStyle.Danger);
  
          const targetChannel = interaction.guild.channels.cache.find(
            (c) => c.name === "siphon-requests" && c.type === ChannelType.GuildText
          );
  
          if (targetChannel) {
            const row = new ActionRowBuilder().addComponents(confirm, cancel);
  
            const response = await targetChannel.send({
              content: `--------------------------------\nDeposit request from ${user}\nAmount: ${userDefinedValue} <:SEnergy:1313155878928777267>\n--------------------------------\n${screenshotUrl}`,
              components: [row],
            });
  
            const collectorFilter = (i) => i.customId.endsWith(requestId);
  
            try {
              const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 24 * 60 * 60 * 1000,
              });
  
              if (confirmation.customId.startsWith("confirm")) {
                await addBalance(interaction.user.id, userDefinedValue);
                await interaction.editReply({
                  content: `Deposit for <@${interaction.user.id}> successful! Do /balance to see your balance at any time.\nCurrent balance: ${getBalance(interaction.user.id)}`,
                });
                await response.edit({
                  content: `Deposit request from ${user}\nAmount: ${userDefinedValue} <:SEnergy:1313155878928777267>\n${screenshotUrl}\n**ACCEPTED**`,
                  components: []
                });
              } else if (confirmation.customId.startsWith("cancel")) {
                await response.edit({
                  content: `Deposit request from ${user}\nAmount: ${userDefinedValue} <:SEnergy:1313155878928777267>\n${screenshotUrl}\n**CANCELED**`,
                  components: []
                });
                await interaction.channel.send({
                  content: `<@${interaction.user.id}>\nDeposit canceled! Please contact an officer or above to hear why.`,
                  components: [],
                });
              }
            } catch (e) {
              console.log(e.message);
            }
          } else {
            await interaction.editReply("Channel not found!");
          }
        } catch (error) {
          console.log(error);
          await interaction.followUp({
            content: `You did not provide a valid screenshot. Please try again.`,
            ephemeral: true
          });
          collectScreenshot(); // 
        }
      };
  
      collectScreenshot();
    },
  };
  