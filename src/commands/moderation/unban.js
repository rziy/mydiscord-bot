const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

const modLogger = require("../../utils/modLogger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban user")
    .addStringOption((option) =>
      option.setName("userid").setDescription("ID user").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const userId = interaction.options.getString("userid");

    const bans = await interaction.guild.bans.fetch();

    const bannedUser = bans.get(userId);

    if (!bannedUser) {
      return interaction.reply({
        content: "❌ User tidak ditemukan dalam daftar ban.",
        ephemeral: true,
      });
    }

    await interaction.guild.members.unban(userId);

    await interaction.reply({
      content: `✅ ${bannedUser.user.tag} berhasil di-unban.`,
    });

    const logEmbed = new EmbedBuilder()
      .setTitle("🔓 Member Unbanned")
      .addFields(
        { name: "User", value: bannedUser.user.tag, inline: true },
        { name: "Moderator", value: interaction.user.tag, inline: true },
      )
      .setTimestamp();

    await modLogger(interaction.guild, logEmbed);
  },
  async prefixExecute(message, args) {
    if (!message.member.permissions.has("BanMembers")) {
      return message.reply("❌ Kamu tidak punya izin.");
    }

    const userId = args[0];

    if (!userId) {
      return message.reply("Usage: `.unban userid`");
    }

    const bans = await message.guild.bans.fetch();

    const bannedUser = bans.get(userId);

    if (!bannedUser) {
      return message.reply("❌ User tidak ditemukan dalam daftar ban.");
    }

    await message.guild.members.unban(userId);

    await message.reply(`✅ ${bannedUser.user.tag} berhasil di-unban.`);

    const logEmbed = new EmbedBuilder()
      .setTitle("🔓 Member Unbanned")
      .addFields(
        {
          name: "User",
          value: bannedUser.user.tag,
          inline: true,
        },
        {
          name: "Moderator",
          value: message.author.tag,
          inline: true,
        },
      )
      .setTimestamp();

    await modLogger(message.guild, logEmbed);
  },
};
