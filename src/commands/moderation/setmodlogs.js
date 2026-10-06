const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setmodlog")
    .setDescription("Set channel mod logs")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Channel log moderation")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    db.prepare(
      `
      INSERT INTO guild_settings
      (guild_id, modlog_channel)
      VALUES (?, ?)
      ON CONFLICT(guild_id)
      DO UPDATE SET
      modlog_channel = excluded.modlog_channel
    `,
    ).run(interaction.guild.id, channel.id);

    await interaction.reply({
      content: `✅ Mod log channel diatur ke ${channel}`,
    });
  },
};
