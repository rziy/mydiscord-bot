const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addbadword")
    .setDescription("Tambah kata terlarang")
    .addStringOption((option) =>
      option.setName("word").setDescription("Kata").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const word = interaction.options.getString("word").toLowerCase();

    db.prepare(
      `
      INSERT OR IGNORE INTO badwords
      (guild_id, word)
      VALUES (?, ?)
    `,
    ).run(interaction.guild.id, word);

    await interaction.reply({
      content: `✅ Badword ditambahkan: **${word}**`,
    });
  },
};
