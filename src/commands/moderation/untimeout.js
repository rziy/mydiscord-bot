const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

const modLogger = require("../../utils/modLogger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Hapus timeout")
    .addUserOption((option) =>
      option.setName("user").setDescription("Target user").setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const member = interaction.options.getMember("user");

    await member.timeout(null);

    await interaction.reply({
      content: `🔊 Timeout ${member.user.tag} dihapus.`,
    });

    const logEmbed = new EmbedBuilder()
      .setTitle("🔊 Timeout Removed")
      .addFields(
        { name: "User", value: member.user.tag, inline: true },
        { name: "Moderator", value: interaction.user.tag, inline: true },
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
      return message.reply("Usage: `.untimeout @user`");
    }

    await member.timeout(null);

    await message.reply(`🔊 Timeout ${member.user.tag} dihapus.`);

    const logEmbed = new EmbedBuilder()
      .setTitle("🔊 Timeout Removed")
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
      )
      .setTimestamp();

    await modLogger(message.guild, logEmbed);
  },
};
