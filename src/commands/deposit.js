const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
  AttachmentBuilder,
  PermissionsBitField,
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
    let isDone = false;

    const thread = await interaction.channel.threads.create({
      name: `Deposit Request from ${interaction.user.tag}`,
      type: ChannelType.PrivateThread,
      reason: `Deposit request for ${interaction.user.tag}`,
      autoArchiveDuration: 1440,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
      ],
    });

    await thread.members.add(interaction.user.id);

    await interaction.reply({
      content: `Deposit request created.`,
      ephemeral: true,
    });

    const step1 = new EmbedBuilder()
      .setTitle(
        `Deposit for ${interaction.user.tag} of ${userDefinedValue} siphoned energy <:SEnergy:1313155878928777267>`
      )
      .setDescription(
        `You are trying to deposit ${userDefinedValue} siphoned energy, \nplease provide a screenshot of the deposit in Albion Online.\n\nThis can be done by going to the guild tab, finding the "Guild Logs" button, (look for a button that screams "statistics") - then pressing your 3rd option called "Guild Account Logs". From here you simply hit the dropdown menu where it says "Silver" and choose "Siphoned Energy".\n\nIf you are on **Windows**, \nsimply press __WIN+SHIFT+S to take a screenshot__ when ingame. \nThen come back here and press __CTRL+V__\n\nIf you can\'t find it, please see the screenshots attached.\n\n__**STEP 1**__`
      )
      .setImage("https://i.imgur.com/XTtS2kW.png")
      .setColor("#ED4245");

    // Step 2 Embed
    const step2 = new EmbedBuilder()
      .setTitle("STEP 2")
      .setImage("https://i.imgur.com/9xAzCQ0.png")
      .setColor("#ED4245");

    // Step 3 Embed
    const step3 = new EmbedBuilder()
      .setTitle("STEP 3")
      .setImage("https://i.imgur.com/197oB2q.png")
      .setFooter({ text: "MADE BY @caellex" })
      .setColor("#ED4245");

    const botThreadMessage = await thread.send({
      embeds: [step1, step2, step3],
    });

    const filter = (message) =>
      message.author.id === interaction.user.id && message.attachments.size > 0;
    const user = interaction.user.tag;

    const collectScreenshot = async () => {
      while (!isDone) {
        try {
          const collected = await thread.awaitMessages({
            filter,
            max: 1,
            time: 60000,
            errors: ["time"],
          });
          const userMessage = collected.first();

          if (!userMessage || userMessage.attachments.size === 0) {
            throw new Error("No valid screenshot provided.");
          }

          const screenshotUrl = userMessage.attachments?.first().url
            ? `${userMessage.attachments.first().url}`
            : "IMG not found";

          const screenshotAttachment = new AttachmentBuilder(screenshotUrl);

          const thankYouEmbed = new EmbedBuilder()
            .setTitle("Thank you for providing a screenshot.")
            .setDescription(
              "Thank you for providing a screenshot, this has been forwarded to the Bankers and Guild Officers. You will have a response within 24 hours."
            )
            .setFooter({ text: "MADE BY @caellex" })
            .setColor("#ED4245");

          await botThreadMessage.edit({
            embeds: [thankYouEmbed],
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
            (c) =>
              c.name === "siphon-requests" && c.type === ChannelType.GuildText
          );

          if (targetChannel) {
            const row = new ActionRowBuilder().addComponents(confirm, cancel);
            const bankerRole = interaction.guild.roles.cache.find(
              (role) => role.name === "Banker"
            );

            const response = await targetChannel.send({
              content: `<@&${bankerRole.id}>`,
              embeds: [
                new EmbedBuilder()
                  .setTitle("Deposit Request")
                  .setDescription(
                    `Deposit request from ${user}\nAmount: ${userDefinedValue} <:SEnergy:1313155878928777267>`
                  )
                  .setColor(0x00ff00)
                  .addFields({
                    name: "Details: (if any)",
                    value: "--------------------------------",
                  })
                  .setImage("attachment://screenshot.png")
                  .setFooter({ text: "MADE BY @caellex" }),
              ],
              files: [screenshotAttachment],
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
                await thread.send({
                  content: `<@${interaction.user.id}> There has been an update in your deposit!`,
                });
                await botThreadMessage.edit({
                  content: `Deposit for <@${
                    interaction.user.id
                  }> successful! Do /balance to see your balance at any time.\nCurrent balance: ${getBalance(
                    interaction.user.id
                  )}`,
                });
                if (userMessage) userMessage.delete();
                await response.edit({
                  content: `Deposit request from ${user}\nAmount: ${userDefinedValue} <:SEnergy:1313155878928777267>\n**ACCEPTED**`,
                  files: [screenshotAttachment],
                  components: [],
                });
              } else if (confirmation.customId.startsWith("cancel")) {
                await response.edit({
                  content: `Deposit request from ${user}\nAmount: ${userDefinedValue} <:SEnergy:1313155878928777267>\n**CANCELED**`,
                  files: [screenshotAttachment],
                  components: [],
                });
                await thread.send({
                  content: `<@${interaction.user.id}> There has been an update in your deposit!`,
                });
                await botThreadMessage.edit({
                  content: `Deposit canceled! Please contact an officer or above to hear why.`,
                  components: [],
                });
                if (userMessage) userMessage.delete();
              }
              isDone = true;
            } catch (e) {
              console.log(e.message);
              isDone = true;
            }
          } else {
            await interaction.editReply("Channel not found!");
            isDone = true;
          }
        } catch (error) {
          console.log(error);
          await interaction.followUp({
            content: `You did not provide a valid screenshot. Please try again.`,
            ephemeral: true,
          });
          
          if (thread) {
            try {
              await thread.delete();
            } catch (deleteError) {
              console.error(`Failed to delete thread: ${deleteError.message}`);
            }
          }
          isDone = true;
        }
      }
    };

    collectScreenshot();
  },
};
