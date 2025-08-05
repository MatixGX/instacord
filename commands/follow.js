const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserModel = require("../models/user");
const config = require("../config.json")

module.exports = {
  data: new SlashCommandBuilder()
    .setName(config.commands_config.follow.command_name)
    .setDescription(config.commands_config.follow.description)
    .addUserOption((option) =>
      option
        .setName(config.commands_config.follow.person_option_name)
        .setDescription(config.commands_config.follow.person_option_description)
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const usingUser = await UserModel.findOne({
      DiscordID: interaction.user.id,
    });

    if (usingUser) {
      const following = usingUser.Following;
      const followID = interaction.options.getUser(config.commands_config.follow.person_option_name).id;
      if (following.includes(followID)) {
        await interaction.reply({
          content: config.commands_config.follow.messages.errors.already_following,
          ephemeral: true,
        });
      } else {
        const userToFolllow = await UserModel.findOne({ DiscordID: followID });
        if (userToFolllow) {
          await UserModel.updateOne(
            { DiscordID: usingUser.DiscordID },
            {
              $push: {
                Following: followID,
              },
            }
          );
          await UserModel.updateOne(
            { DiscordID: followID },
            {
              $push: {
                Followers: interaction.user.id,
              },
            }
          );

          await interaction.reply({
            content: `${config.commands_config.follow.messages.success} **${
              interaction.options.getUser(config.commands_config.follow.person_option_name).username
            }**`,
            ephemeral: true,
          });
          const instacordGuild = client.guilds.cache.get(config.main_guild_id);
          const followChannel = instacordGuild.channels.cache.get(
            config.follow_logs_channel
          );

          followChannel.send(
            `**<@${interaction.user.id}> ${config.messages_config.just_followed} <@${followID}>**`
          );
        } else {
          await interaction.reply({
            content: config.commands_config.follow.messages.errors.no_account_person,
            ephemeral: true,
          });
        }
      }
    } else {
      await interaction.reply({ content: config.common_errors.no_account_you});
    }
  },
};
