const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setxp")
    .setDescription("Set XP member")
    .addUserOption((option) =>
      option.setName("user").setDescription("Target user").setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Jumlah XP baru")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    db.prepare(
      `
      INSERT OR REPLACE INTO user_levels
      (
        guild_id,
        user_id,
        xp,
        level,
        messages,
        voice_seconds
      )
      VALUES (?, ?, ?, 1, 0, 0)
    `,
    ).run(interaction.guild.id, user.id, amount);

    await interaction.reply({
      content: `✅ XP ${user} diubah menjadi **${amount}**.`,
    });
  },
};
