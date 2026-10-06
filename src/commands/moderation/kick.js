const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

const modLogger = require("../../utils/modLogger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick member")
    .addUserOption((option) =>
      option.setName("user").setDescription("Target user").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Alasan kick"),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const target = interaction.options.getMember("user");

    const reason =
      interaction.options.getString("reason") || "Tidak ada alasan.";

    if (!target) {
      return interaction.reply({
        content: "❌ Member tidak ditemukan.",
        ephemeral: true,
      });
    }

    await target.kick(reason);

    await interaction.reply({
      content: `👢 ${target.user.tag} dikick.`,
    });

    const logEmbed = new EmbedBuilder()
      .setTitle("👢 Member Kicked")
      .addFields(
        { name: "User", value: target.user.tag, inline: true },
        { name: "Moderator", value: interaction.user.tag, inline: true },
        { name: "Reason", value: reason },
      )
      .setTimestamp();

    await modLogger(interaction.guild, logEmbed);
  },
  async prefixExecute(message, args) {
    if (!message.member.permissions.has("KickMembers")) {
      return message.reply("❌ Kamu tidak punya izin.");
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.reply("Usage: `.kick @user alasan`");
    }

    args.shift();

    const reason = args.join(" ") || "Tidak ada alasan.";

    await target.kick(reason);

    await message.reply(`👢 ${target.user.tag} dikick.`);

    const logEmbed = new EmbedBuilder()
      .setTitle("👢 Member Kicked")
      .addFields(
        {
          name: "User",
          value: target.user.tag,
          inline: true,
        },
        {
          name: "Moderator",
          value: message.author.tag,
          inline: true,
        },
        {
          name: "Reason",
          value: reason,
        },
      )
      .setTimestamp();

    await modLogger(message.guild, logEmbed);
  },
};
