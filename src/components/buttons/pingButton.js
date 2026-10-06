const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  customId: "ping_button",

  async execute(interaction) {
    await interaction.reply({
      content: `🏓 Pong! ${interaction.client.ws.ping}ms`,
      ephemeral: true,
    });
  },
};
