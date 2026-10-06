const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("titles")
    .setDescription("Lihat semua title reward"),

  async execute(interaction) {
    const titles = db
      .prepare(
        `
        SELECT *
        FROM title_rewards
        WHERE guild_id = ?
        ORDER BY level ASC
      `,
      )
      .all(interaction.guild.id);

    if (!titles.length) {
      return interaction.reply({
        content: "❌ Belum ada title reward.",
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🏆 Title Rewards")
      .setColor("#8b5cf6")
      .setDescription(
        titles.map((t) => `**Level ${t.level}** → ${t.title}`).join("\n"),
      );

    await interaction.reply({
      embeds: [embed],
    });
  },
};
