const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("testleave")
    .setDescription("Test leave message")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const settings = db
      .prepare(
        `
        SELECT *
        FROM guild_settings
        WHERE guild_id = ?
      `,
      )
      .get(interaction.guild.id);

    if (!settings?.welcome_channel) {
      return interaction.reply({
        content: "❌ Welcome/Leave channel belum diatur.",
      });
    }

    const channel = interaction.guild.channels.cache.get(
      settings.welcome_channel,
    );

    if (!channel) {
      return interaction.reply({
        content: "❌ Channel tidak ditemukan.",
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#ff4d4d")
      .setDescription(
        `## さようなら! ${interaction.user.username}

See you next time.`,
      )
      .setThumbnail(
        interaction.user.displayAvatarURL({
          size: 256,
          extension: "png",
        }),
      )
      .setFooter({
        text: `© rei 2026 | ${interaction.guild.id}`,
      })
      .setTimestamp();

    await channel.send({
      embeds: [embed],
    });

    await interaction.reply({
      content: "✅ Test leave berhasil dikirim.",
    });
  },
};
