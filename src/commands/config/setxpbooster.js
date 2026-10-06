const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setxpbooster")
    .setDescription("Set XP booster role")
    .addRoleOption((option) =>
      option.setName("role").setDescription("Role").setRequired(true),
    )
    .addNumberOption((option) =>
      option
        .setName("multiplier")
        .setDescription("XP Multiplier")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole("role");

    const multiplier = interaction.options.getNumber("multiplier");

    if (multiplier < 1) {
      return interaction.reply({
        content: "❌ Multiplier harus minimal 1.",
        ephemeral: true,
      });
    }

    db.prepare(
      `
      INSERT OR REPLACE INTO xp_booster_roles
      (guild_id, role_id, multiplier)
      VALUES (?, ?, ?)
    `,
    ).run(interaction.guild.id, role.id, multiplier);

    await interaction.reply({
      content: `✅ ${role} sekarang memberi **${multiplier}x XP**.`,
    });
  },
};
