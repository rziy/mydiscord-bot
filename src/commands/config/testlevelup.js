const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("testlevelup")
    .setDescription("Tes pesan level up")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const settings = db
      .prepare(
        `
        SELECT *
        FROM guild_level_settings
        WHERE guild_id = ?
      `,
      )
      .get(interaction.guild.id);

    let content =
      settings?.levelup_message ||
      "🎉 {user.mention} naik ke level {user.level}!";

    content = content
      .replaceAll("{user.mention}", `<@${interaction.user.id}>`)
      .replaceAll("{user.name}", interaction.user.username)
      .replaceAll("{user.level}", "99")
      .replaceAll("{user.xp}", "99999")
      .replaceAll("{earned}", "🏅 Role Reward Test");

    await interaction.reply({
      content,
    });
  },
};
