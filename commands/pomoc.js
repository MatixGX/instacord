const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const config = require("../config.json")

module.exports = {
  data: new SlashCommandBuilder()
    .setName(config.commands_config.help.command_name)
    .setDescription(config.commands_config.help.description),

  async execute(interaction, client) {
    await interaction.reply({
      content: config.commands_config.help.help_msg,
      ephemeral: true,
    });
  },
};
