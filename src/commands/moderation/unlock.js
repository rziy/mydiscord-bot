const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlock channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        SendMessages: null,
      },
    );

    await interaction.reply("🔓 Channel dibuka.");
  },
  async prefixExecute(message) {
    if (!message.member.permissions.has("ManageChannels")) {
      return message.reply("❌ Kamu tidak punya izin.");
    }

    await message.channel.permissionOverwrites.edit(
      message.guild.roles.everyone,
      {
        SendMessages: null,
      },
    );

    await message.reply("🔓 Channel dibuka.");
  },
};
