console.log("GUILD MEMBER REMOVE LOADED");
const { Events, EmbedBuilder } = require("discord.js");
const db = require("../../database/db");

module.exports = {
  name: Events.GuildMemberRemove,

  async execute(member) {
    const settings = db
      .prepare(
        `
        SELECT *
        FROM guild_settings
        WHERE guild_id = ?
      `,
      )
      .get(member.guild.id);

    if (!settings) return;

    if (!settings.welcome_channel) return;

    const channel = member.guild.channels.cache.get(settings.welcome_channel);

    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#ff4d4d")
      .setDescription(
        `## さようなら! ${member.user.username}

See you next time.`,
      )
      .setThumbnail(
        member.user.displayAvatarURL({
          size: 256,
          extension: "png",
        }),
      )
      .setFooter({
        text: `© rei 2026 | ${member.guild.id}`,
      })
      .setTimestamp();

    await channel.send({
      content: `<@${member.id}>`,
      embeds: [embed],
    });
  },
};
