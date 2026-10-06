const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setautorole")
    .setDescription("Set role otomatis saat member join")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Role yang diberikan")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole("role");

    db.prepare(
      `
      INSERT INTO guild_settings
      (guild_id, autorole_id)
      VALUES (?, ?)
      ON CONFLICT(guild_id)
      DO UPDATE SET autorole_id = excluded.autorole_id
    `,
    ).run(interaction.guild.id, role.id);

    await interaction.reply({
      content: `✅ Auto role diset ke ${role}`,
    });
  },
};
