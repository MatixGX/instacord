const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const UserModel = require("../models/user");
const config = require("../config.json")

module.exports = {
  data: new SlashCommandBuilder()
    .setName(config.commands_config.followers.command_name)
    .setDescription(config.commands_config.followers.description),

  async execute(interaction, client) {
    const gettingUser = await UserModel.findOne({
      DiscordID: interaction.user.id,
    });

    if (gettingUser) {
      const obs = gettingUser.Following;

      OsbString = `## ${config.messages_config.following} \n`;
      obs.forEach((follow) => {
        OsbString += `- <@${follow}>\n`;
      });
      await interaction.reply({ content: OsbString, ephemeral: true });
    } else {
      await interaction.reply({ content: config.common_errors.no_account_you, ephemeral: true });
    }
  },
};
