const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Lihat info server"),

  async execute(interaction) {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 1024 }))
      .addFields(
        {
          name: "Owner",
          value: `<@${guild.ownerId}>`,
          inline: true,
        },
        {
          name: "Members",
          value: `${guild.memberCount}`,
          inline: true,
        },
        {
          name: "Channels",
          value: `${guild.channels.cache.size}`,
          inline: true,
        },
      );

    await interaction.reply({
      embeds: [embed],
    });
  },
  async prefixExecute(message) {
    const guild = message.guild;

    const embed = new EmbedBuilder()
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 1024 }))
      .addFields(
        {
          name: "Owner",
          value: `<@${guild.ownerId}>`,
          inline: true,
        },
        {
          name: "Members",
          value: `${guild.memberCount}`,
          inline: true,
        },
        {
          name: "Channels",
          value: `${guild.channels.cache.size}`,
          inline: true,
        },
      );

    await message.reply({
      embeds: [embed],
    });
  },
};
