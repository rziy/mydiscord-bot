const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("support")
    .setDescription("Server support bot"),

  async execute(interaction) {
    await interaction.reply({
      content: "💬 Support Server: https://discord.gg/KsbuavfTwf",
    });
  },
};
