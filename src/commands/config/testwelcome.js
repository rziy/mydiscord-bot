const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("testwelcome")
    .setDescription("Test welcome message")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const settings = db
      .prepare(
        `
      SELECT *
      FROM guild_settings
      WHERE guild_id = ?
    `,
      )
      .get(interaction.guild.id);

    if (!settings?.welcome_channel) {
      return interaction.reply({
        content: "❌ Welcome channel belum diatur.",
        ephemeral: true,
      });
    }

    const channel = interaction.guild.channels.cache.get(
      settings.welcome_channel,
    );

    if (!channel) {
      return interaction.reply({
        content: "❌ Welcome channel tidak ditemukan.",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#00ff66")
      .setDescription(
        `**ようこそ! ${interaction.user.username}**\n\nEnjoy your stay.\n\n© rei 2026 | ${interaction.guild.id}`,
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp();

    await channel.send({
      content: `${interaction.user}`,
      embeds: [embed],
    });

    await interaction.reply({
      content: "✅ Test welcome berhasil dikirim.",
      ephemeral: true,
    });
  },
};
