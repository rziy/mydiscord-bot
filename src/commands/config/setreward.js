const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setreward")
    .setDescription("Set role reward untuk level tertentu")
    .addIntegerOption((option) =>
      option
        .setName("level")
        .setDescription("Level yang dibutuhkan")
        .setRequired(true),
    )
    .addRoleOption((option) =>
      option.setName("role").setDescription("Role reward").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const level = interaction.options.getInteger("level");
    const role = interaction.options.getRole("role");

    db.prepare(
      `
      INSERT OR REPLACE INTO level_rewards
      (guild_id, level, role_id)
      VALUES (?, ?, ?)
    `,
    ).run(interaction.guild.id, level, role.id);

    await interaction.reply({
      content: `✅ Reward level **${level}** diset ke role ${role}.`,
    });
  },
};
