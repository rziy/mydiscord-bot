const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("xpsettings")
    .setDescription("Lihat konfigurasi XP"),

  async execute(interaction) {
    const settings = db
      .prepare(
        `
        SELECT *
        FROM guild_level_settings
        WHERE guild_id = ?
      `,
      )
      .get(interaction.guild.id);

    if (!settings) {
      return interaction.reply({
        content: "❌ Belum ada konfigurasi XP.",
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("⚙️ XP Settings")
      .setDescription(
        `
**Enabled:** ${settings.enabled}
**Min XP:** ${settings.min_xp}
**Max XP:** ${settings.max_xp}
**Cooldown:** ${settings.cooldown}s
**Multiplier:** ${settings.multiplier}
**Curve:** ${settings.curve}
**Max Level:** ${settings.max_level}
`,
      );

    await interaction.reply({
      embeds: [embed],
    });
  },
};
