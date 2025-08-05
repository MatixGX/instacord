const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserModel = require("../models/user");
const config = require("../config.json")

module.exports = {
  data: new SlashCommandBuilder()
    .setName(config.commands_config.unfollow.command_name)
    .setDescription(config.commands_config.unfollow.description)
    .addUserOption((option) =>
      option
        .setName(config.commands_config.unfollow.person_option_name)
        .setDescription(config.commands_config.unfollow.person_option_description)
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const usingUser = await UserModel.findOne({
      DiscordID: interaction.user.id,
    });

    if (usingUser) {
      const following = usingUser.Following;
      const unfollowID = interaction.options.getUser(config.commands_config.unfollow.person_option_name).id;
      if (!following.includes(unfollowID)) {
        await interaction.reply({
          content: config.commands_config.unfollow.errors.not_following,
          ephemeral: true,
        });
      } else {
        const unFollowUser = await UserModel.findOne({ DiscordID: unfollowID });
        if (unFollowUser) {
          await UserModel.updateOne(
            { DiscordID: usingUser.DiscordID },
            {
              $pull: {
                Following: unfollowID,
              },
            }
          );

          await UserModel.updateOne(
            { DiscordID: unfollowID },
            {
              $pull: {
                Followers: interaction.user.id,
              },
            }
          );

          await interaction.reply({
            content: `${config.commands_config.unfollow.msg.unfollowed} **${
              interaction.options.getUser("osoba").username
            }**`,
            ephemeral: true,
          });

          const instacordGuild = client.guilds.cache.get(config.main_guild_id);
          const followChannel = instacordGuild.channels.cache.get(
            config.follow_logs_channel
          );

          followChannel.send(
            `**<@${interaction.user.id}> ${config.messages_config.unfollowed} <@${unfollowID}>**`
          );
        } else {
          await interaction.reply({
            content: config.commands_config.unfollow.errors.no_account_person,
            ephemeral: true,
          });
        }
      }
    } else {
      await interaction.reply({ content: config.common_errors.no_account_you, ephemeral: true });
    }
  },
};
