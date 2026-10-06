const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

const modLogger = require("../../utils/modLogger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban member dari server")
    .addUserOption((option) =>
      option.setName("user").setDescription("Target user").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Alasan ban"),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getMember("user");
    const user = interaction.options.getUser("user");

    const reason =
      interaction.options.getString("reason") || "Tidak ada alasan.";

    if (!target) {
      return interaction.reply({
        content: "❌ Member tidak ditemukan.",
        ephemeral: true,
      });
    }

    if (!target.bannable) {
      return interaction.reply({
        content: "❌ Saya tidak bisa memban member tersebut.",
        ephemeral: true,
      });
    }

    await target.ban({ reason });

    await interaction.reply({
      content: `🔨 ${user.tag} diban.\nReason: ${reason}`,
    });

    const logEmbed = new EmbedBuilder()
      .setTitle("🔨 Member Banned")
      .addFields(
        { name: "User", value: user.tag, inline: true },
        { name: "Moderator", value: interaction.user.tag, inline: true },
        { name: "Reason", value: reason },
      )
      .setTimestamp();

    await modLogger(interaction.guild, logEmbed);
  },
  async prefixExecute(message, args) {
    if (!message.member.permissions.has("BanMembers")) {
      return message.reply("❌ Kamu tidak punya izin.");
    }

    const target = message.mentions.members.first();

    if (!target) {
      return message.reply("Usage: `.ban @user alasan`");
    }

    args.shift();

    const reason = args.join(" ") || "Tidak ada alasan.";

    if (!target.bannable) {
      return message.reply("❌ Saya tidak bisa memban member tersebut.");
    }

    await target.ban({ reason });

    await message.reply(`🔨 ${target.user.tag} diban.\nReason: ${reason}`);

    const logEmbed = new EmbedBuilder()
      .setTitle("🔨 Member Banned")
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
