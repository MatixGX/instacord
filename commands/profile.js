const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserModel = require("../models/user");
const config = require("../config.json")

module.exports = {
  data: new SlashCommandBuilder()
    .setName(config.commands_config.profile.command_name)
    .setDescription(config.commands_config.profile.description)
    .addUserOption((option) =>
      option
        .setName(config.commands_config.profile.person_option_name)
        .setDescription(
          config.commands_config.profile.person_option_description
        )
        .setRequired(false)
    ),

  async execute(interaction, client) {
    if (interaction.options.getUser(config.commands_config.profile.person_option_name) == undefined) {
      const InstacordUser = await UserModel.findOne({
        DiscordID: interaction.user.id,
      });

      if (InstacordUser) {
        const profileEmbed = new EmbedBuilder()
          .setColor(0xffffff)
          .setThumbnail(
            `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}`
          )
          .setTitle(InstacordUser.ProfileName)
          .addFields(
            {
              name: config.commands_config.profile.fields.followers,
              value: InstacordUser.Followers.length.toString(),
              inline: true,
            },
            {
              name: config.commands_config.profile.fields.following,
              value: InstacordUser.Following.length.toString(),
              inline: true,
            },
            {
              name: config.commands_config.profile.fields.profile,
              value: `<#${InstacordUser.ProfileLink}>`,
              inline: true,
            }
          );
        await interaction.reply({ embeds: [profileEmbed] });
      } else {
        await interaction.reply({
          content: config.common_errors.no_account_you,
          ephemeral: true,
        });
      }
    } else {
      const InstacordUser = await UserModel.findOne({
        DiscordID: interaction.options.getUser(config.commands_config.profile.person_option_name).id,
      });

      if (InstacordUser) {
        const profileEmbed = new EmbedBuilder()
          .setColor(0xffffff)
          .setThumbnail(
            `https://cdn.discordapp.com/avatars/${InstacordUser.DiscordID}/${
              interaction.options.getUser(config.commands_config.profile.person_option_name).avatar
            }`
          )
          .setTitle(InstacordUser.ProfileName)
          .addFields(
            {
              name: config.commands_config.profile.fields.followers,
              value: InstacordUser.Followers.length.toString(),
              inline: true,
            },
            {
              name: config.commands_config.profile.fields.following,
              value: InstacordUser.Following.length.toString(),
              inline: true,
            },
            {
              name: config.commands_config.profile.fields.profile,
              value: `<#${InstacordUser.ProfileLink}>`,
              inline: true,
            }
          );
        await interaction.reply({ embeds: [profileEmbed] });
      } else {
        await interaction.reply({
          content: config.commands_config.profile.errors.no_account_person,
          ephemeral: true,
        });
      }
    }
  },
};
