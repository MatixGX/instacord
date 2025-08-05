const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");
const UserModel = require("../models/user");
const config = require("../config.json")

module.exports = {
  data: new SlashCommandBuilder()
    .setName(config.commands_config.register.command_name)
    .setDescription(
      config.commands_config.register.description
    )
    .addStringOption((option) =>
      option
        .setName(config.commands_config.register.name_option_name)
        .setDescription(config.commands_config.register.name_option_description)
        .setRequired(true)
    ),

  async execute(interaction, client) {
    if (interaction.channel.id == config.register_channel) {
      const foundUser = await UserModel.findOne({
        DiscordID: interaction.user.id,
      });
      const name = interaction.options.getString(config.commands_config.register.name_option_name);
      const instacordGuild = client.guilds.cache.get(config.main_guild_id);
      const signedOutRole = instacordGuild.roles.cache.get(
        config.logged_out_role_id
      );
      const loggedInRole = instacordGuild.roles.cache.get(
        config.user_role_id
      );
      const accountsCathegory = instacordGuild.channels.cache.get(
        config.accounts_cathegory_id
      );

      if (!foundUser) {
        const ownChannel = await instacordGuild.channels.create({
          name: name,
          type: ChannelType.GuildForum,
          parent: config.accounts_cathegory_id,
          rateLimitPerUser: "30",
          defaultForumLayout: 2,
          defaultReactionEmoji: ":heart:",
          permissionOverwrites: [
            {
              id: interaction.user.id,
              allow: [
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.AttachFiles,
              ],
            },
            {
              id: instacordGuild.roles.everyone.id,
              allow: [PermissionsBitField.Flags.SendMessagesInThreads],
              deny: [
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.CreatePrivateThreads,
                PermissionsBitField.Flags.CreatePublicThreads,
                PermissionsBitField.Flags.AttachFiles,
              ],
            },
            {
              id: config.logged_out_role_id,
              deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
              id: config.user_role_id,
              allow: [PermissionsBitField.Flags.ViewChannel],
            },
          ],
        });
        await UserModel.create({
          DiscordID: interaction.user.id,
          Followers: [],
          Following: [],
          ProfileName: name,
          ProfileLink: ownChannel.id,
        });
        const userId = interaction.user.id;
        const userInter = instacordGuild.members.cache.get(userId);
        await userInter.roles.add(loggedInRole);
        await userInter.roles.remove(signedOutRole);
        await interaction.reply(
          `${config.messages_config.success_creating_account} <#${ownChannel.id}> \n ${config.messages_config.use_register_to_register}`
        );
      } else {
        await interaction.reply({
          content: config.common_errors.alreade_have_an_account,
          ephemeral: true,
        });
      }
    } else {
      await interaction.reply({
        content: config.common_errors.cant_use_this_here,
        ephemeral: true,
      });
    }
  },
};
