const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Informasi bot"),

  async execute(interaction, client) {
    const embed = new EmbedBuilder().setTitle(client.user.username).addFields(
      {
        name: "Servers",
        value: `${client.guilds.cache.size}`,
        inline: true,
      },
      {
        name: "Users",
        value: `${client.users.cache.size}`,
        inline: true,
      },
      {
        name: "Commands",
        value: `${client.commands.size}`,
        inline: true,
      },
    );

    await interaction.reply({
      embeds: [embed],
    });
  },
  async prefixExecute(message, args, client) {
    const embed = new EmbedBuilder().setTitle(client.user.username).addFields(
      {
        name: "Servers",
        value: `${client.guilds.cache.size}`,
        inline: true,
      },
      {
        name: "Users",
        value: `${client.users.cache.size}`,
        inline: true,
      },
      {
        name: "Commands",
        value: `${client.commands.size}`,
        inline: true,
      },
    );

    await message.reply({
      embeds: [embed],
    });
  },
};
