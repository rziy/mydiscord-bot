const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("noxpchannel")
    .setDescription("Kelola channel yang tidak memberi XP")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Tambah channel no XP")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    )

    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Hapus channel no XP")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    )

    .addSubcommand((sub) =>
      sub.setName("list").setDescription("Lihat daftar channel no XP"),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "add") {
      const channel = interaction.options.getChannel("channel");

      db.prepare(
        `
        INSERT OR REPLACE INTO no_xp_channels
        (guild_id, channel_id)
        VALUES (?, ?)
      `,
      ).run(interaction.guild.id, channel.id);

      return interaction.reply({
        content: `✅ ${channel} ditambahkan ke No XP Channel.`,
      });
    }

    if (sub === "remove") {
      const channel = interaction.options.getChannel("channel");

      db.prepare(
        `
        DELETE FROM no_xp_channels
        WHERE guild_id = ?
        AND channel_id = ?
      `,
      ).run(interaction.guild.id, channel.id);

      return interaction.reply({
        content: `✅ ${channel} dihapus dari No XP Channel.`,
      });
    }

    if (sub === "list") {
      const channels = db
        .prepare(
          `
        SELECT *
        FROM no_xp_channels
        WHERE guild_id = ?
      `,
        )
        .all(interaction.guild.id);

      if (!channels.length) {
        return interaction.reply({
          content: "❌ Tidak ada channel yang diblok XP.",
        });
      }

      const list = channels.map((c) => `<#${c.channel_id}>`).join("\n");

      return interaction.reply({
        content: `📋 **No XP Channels**\n\n${list}`,
      });
    }
  },
};
