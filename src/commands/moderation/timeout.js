const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

const ms = require("ms");
const modLogger = require("../../utils/modLogger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout member")
    .addUserOption((option) =>
      option.setName("user").setDescription("Target user").setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("10m, 1h, 1d")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Alasan timeout"),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const member = interaction.options.getMember("user");

    const duration = interaction.options.getString("duration");

    const reason =
      interaction.options.getString("reason") || "Tidak ada alasan.";

    const time = ms(duration);

    await member.timeout(time, reason);

    await interaction.reply({
      content: `🔇 ${member.user.tag} timeout selama ${duration}`,
    });

    const logEmbed = new EmbedBuilder()
      .setTitle("🔇 Member Timed Out")
      .addFields(
        { name: "User", value: member.user.tag, inline: true },
        { name: "Moderator", value: interaction.user.tag, inline: true },
        { name: "Duration", value: duration, inline: true },
        { name: "Reason", value: reason },
      )
      .setTimestamp();

    await modLogger(interaction.guild, logEmbed);
  },
  async prefixExecute(message, args) {
    if (!message.member.permissions.has("ModerateMembers")) {
      return message.reply("❌ Kamu tidak punya izin.");
    }

    const member = message.mentions.members.first();

    if (!member) {
      return message.reply("Usage: `.timeout @user 10m alasan`");
    }

    args.shift();

    const duration = args.shift();

    if (!duration) {
      return message.reply("Masukkan durasi. Contoh: 10m, 1h, 1d");
    }

    const reason = args.join(" ") || "Tidak ada alasan.";

    const time = ms(duration);

    await member.timeout(time, reason);

    await message.reply(`🔇 ${member.user.tag} timeout selama ${duration}`);

    const logEmbed = new EmbedBuilder()
      .setTitle("🔇 Member Timed Out")
      .addFields(
        {
          name: "User",
          value: member.user.tag,
          inline: true,
        },
        {
          name: "Moderator",
          value: message.author.tag,
          inline: true,
        },
        {
          name: "Duration",
          value: duration,
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
