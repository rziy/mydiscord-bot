console.log("GUILD MEMBER ADD LOADED");
const { Events, EmbedBuilder } = require("discord.js");
const db = require("../../database/db");

module.exports = {
  name: Events.GuildMemberAdd,

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

    if (settings?.autorole_id) {
      const role = member.guild.roles.cache.get(settings.autorole_id);

      if (role) {
        try {
          await member.roles.add(role);
        } catch (err) {
          console.error("[AUTOROLE ERROR]", err);
        }
      }
    }

    if (!settings) return;

    if (!settings.welcome_channel) return;

    const channel = member.guild.channels.cache.get(settings.welcome_channel);

    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor("#00ff66")
      .setDescription(
        `## ようこそ! ${member.user.username}

Enjoy your stay.`,
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
