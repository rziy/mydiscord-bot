const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("togglewelcome")
    .setDescription("Enable / Disable welcome")
    .addBooleanOption((option) =>
      option.setName("enabled").setDescription("Status").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const enabled = interaction.options.getBoolean("enabled");

    db.prepare(
      `
      INSERT INTO guild_settings
      (guild_id, welcome_enabled)
      VALUES (?, ?)
      ON CONFLICT(guild_id)
      DO UPDATE SET
      welcome_enabled = excluded.welcome_enabled
    `,
    ).run(interaction.guild.id, enabled ? 1 : 0);

    await interaction.reply({
      content: enabled ? "✅ Welcome diaktifkan." : "❌ Welcome dimatikan.",
    });
  },
};
