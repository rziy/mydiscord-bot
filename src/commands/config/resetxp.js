const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resetxp")
    .setDescription("Reset data XP member")
    .addUserOption((option) =>
      option.setName("user").setDescription("Target user").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    db.prepare(
      `
      DELETE FROM user_levels
      WHERE guild_id = ?
      AND user_id = ?
    `,
    ).run(interaction.guild.id, user.id);

    await interaction.reply({
      content: `✅ Data XP ${user} berhasil direset.`,
    });
  },
};
