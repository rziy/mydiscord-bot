const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removetitle")
    .setDescription("Hapus title reward")
    .addIntegerOption((option) =>
      option.setName("level").setDescription("Level title").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const level = interaction.options.getInteger("level");

    db.prepare(
      `
      DELETE FROM title_rewards
      WHERE guild_id = ?
      AND level = ?
    `,
    ).run(interaction.guild.id, level);

    await interaction.reply({
      content: `✅ Title reward level **${level}** dihapus.`,
    });
  },
};
