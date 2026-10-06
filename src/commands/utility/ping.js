const { SlashCommandBuilder } = require("discord.js");

const embed = require("../../utils/embed");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency"),

  async execute(interaction) {
    await interaction.reply({
      embeds: [
        embed({
          title: "🏓 Pong!",
          description: `Latency: ${interaction.client.ws.ping}ms`,
        }),
      ],
    });
  },
  async prefixExecute(message) {
    await message.reply({
      embeds: [
        embed({
          title: "🏓 Pong!",
          description: `Latency: ${message.client.ws.ping}ms`,
        }),
      ],
    });
  },
};
