const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setwelcome")
    .setDescription("Set welcome channel")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Welcome channel")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    db.prepare(
      `
      INSERT INTO guild_settings
      (guild_id, welcome_channel)
      VALUES (?, ?)
      ON CONFLICT(guild_id)
      DO UPDATE SET
      welcome_channel = excluded.welcome_channel
    `,
    ).run(interaction.guild.id, channel.id);

    await interaction.reply({
      content: `✅ Welcome channel diatur ke ${channel}`,
    });
  },
};
