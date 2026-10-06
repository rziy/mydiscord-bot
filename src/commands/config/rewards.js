const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rewards")
    .setDescription("Lihat semua role rewards"),

  async execute(interaction) {
    const rewards = db
      .prepare(
        `
        SELECT *
        FROM level_rewards
        WHERE guild_id = ?
        ORDER BY level ASC
      `,
      )
      .all(interaction.guild.id);

    if (!rewards.length) {
      return interaction.reply({
        content: "❌ Belum ada role reward.",
      });
    }

    const description = rewards
      .map((reward) => `**Level ${reward.level}** → <@&${reward.role_id}>`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("🏅 Role Rewards")
      .setDescription(description)
      .setColor("#5865F2");

    await interaction.reply({
      embeds: [embed],
    });
  },
};
