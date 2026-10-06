const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removebadword")
    .setDescription("Hapus kata terlarang")
    .addStringOption((option) =>
      option.setName("word").setDescription("Kata").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const word = interaction.options.getString("word").toLowerCase();

    db.prepare(
      `
      DELETE FROM badwords
      WHERE guild_id = ?
      AND word = ?
    `,
    ).run(interaction.guild.id, word);

    await interaction.reply({
      content: `✅ Badword dihapus: **${word}**`,
    });
  },
};
