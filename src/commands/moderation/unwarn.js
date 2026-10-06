const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

const db = require("../../database/db");
const modLogger = require("../../utils/modLogger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unwarn")
    .setDescription("Hapus 1 warning berdasarkan ID")
    .addIntegerOption((option) =>
      option.setName("id").setDescription("ID warning").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const warningId = interaction.options.getInteger("id");

    const warning = db
      .prepare(
        `
        SELECT *
        FROM warnings
        WHERE id = ?
      `,
      )
      .get(warningId);

    if (!warning) {
      return interaction.reply({
        content: "❌ Warning tidak ditemukan.",
        ephemeral: true,
      });
    }

    db.prepare(
      `
      DELETE FROM warnings
      WHERE id = ?
    `,
    ).run(warningId);

    await interaction.reply({
      content: `✅ Warning #${warningId} berhasil dihapus.`,
    });

    const logEmbed = new EmbedBuilder()
      .setTitle("⚠️ Warning Removed")
      .addFields(
        {
          name: "Moderator",
          value: interaction.user.tag,
        },
        {
          name: "Warning ID",
          value: String(warningId),
        },
      )
      .setTimestamp();

    await modLogger(interaction.guild, logEmbed);
  },
  async prefixExecute(message, args) {
    if (!message.member.permissions.has("ModerateMembers")) {
      return message.reply("❌ Kamu tidak punya izin.");
    }

    const warningId = parseInt(args[0]);

    if (!warningId) {
      return message.reply("Usage: `.unwarn <id>`");
    }

    const warning = db
      .prepare("SELECT * FROM warnings WHERE id = ?")
      .get(warningId);

    if (!warning) {
      return message.reply("❌ Warning tidak ditemukan.");
    }

    db.prepare("DELETE FROM warnings WHERE id = ?").run(warningId);

    await message.reply(`✅ Warning #${warningId} berhasil dihapus.`);

    const logEmbed = new EmbedBuilder()
      .setTitle("⚠️ Warning Removed")
      .addFields(
        {
          name: "Moderator",
          value: message.author.tag,
        },
        {
          name: "Warning ID",
          value: String(warningId),
        },
      )
      .setTimestamp();

    await modLogger(message.guild, logEmbed);
  },
};
