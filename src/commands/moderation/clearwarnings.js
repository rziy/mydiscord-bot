const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

const db = require("../../database/db");
const modLogger = require("../../utils/modLogger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearwarnings")
    .setDescription("Hapus semua warning user")
    .addUserOption((option) =>
      option.setName("user").setDescription("Target user").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    const result = db
      .prepare(
        `
      DELETE FROM warnings
      WHERE guild_id = ?
      AND user_id = ?
    `,
      )
      .run(interaction.guild.id, user.id);

    await interaction.reply({
      content: `✅ ${result.changes} warning milik ${user.tag} berhasil dihapus.`,
    });

    const logEmbed = new EmbedBuilder()
      .setTitle("🗑️ Warnings Cleared")
      .addFields(
        {
          name: "User",
          value: user.tag,
          inline: true,
        },
        {
          name: "Moderator",
          value: interaction.user.tag,
          inline: true,
        },
        {
          name: "Removed",
          value: String(result.changes),
          inline: true,
        },
      )
      .setTimestamp();

    await modLogger(interaction.guild, logEmbed);
  },
};
