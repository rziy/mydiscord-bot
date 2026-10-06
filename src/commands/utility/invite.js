const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Invite bot ke server lain"),

  async execute(interaction) {
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`;

    const embed = new EmbedBuilder()
      .setTitle("🔗 Invite Bot")
      .setDescription(`[Klik disini untuk invite bot](${inviteUrl})`);

    await interaction.reply({
      embeds: [embed],
    });
  },
};
