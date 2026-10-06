const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setlevelup")
    .setDescription("Atur pesan level up")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Pesan level up")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const message = interaction.options.getString("message");

    db.prepare(
      `
      INSERT OR IGNORE INTO guild_level_settings
      (guild_id)
      VALUES (?)
    `,
    ).run(interaction.guild.id);

    db.prepare(
      `
      UPDATE guild_level_settings
      SET levelup_message = ?
      WHERE guild_id = ?
    `,
    ).run(message, interaction.guild.id);

    await interaction.reply({
      content: "✅ Pesan level up berhasil diperbarui.",
    });
  },
};
