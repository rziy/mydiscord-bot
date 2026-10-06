const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removeautorole")
    .setDescription("Matikan auto role")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    db.prepare(
      `
      UPDATE guild_settings
      SET autorole_id = NULL
      WHERE guild_id = ?
    `,
    ).run(interaction.guild.id);

    await interaction.reply({
      content: "✅ Auto role dinonaktifkan.",
    });
  },
};
