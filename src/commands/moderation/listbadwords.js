const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listbadwords")
    .setDescription("Lihat daftar badword")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const words = db
      .prepare(
        `
        SELECT word
        FROM badwords
        WHERE guild_id = ?
        ORDER BY word ASC
      `,
      )
      .all(interaction.guild.id);

    const embed = new EmbedBuilder()
      .setTitle("🚫 Badwords")
      .setDescription(
        words.length
          ? words.map((w) => `• ${w.word}`).join("\n")
          : "Belum ada badword.",
      );

    await interaction.reply({
      embeds: [embed],
    });
  },
};
