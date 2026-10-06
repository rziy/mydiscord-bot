const db = require("../database/db");

module.exports = async (guild, embed) => {
  const config = db
    .prepare(
      `
      SELECT modlog_channel
      FROM guild_settings
      WHERE guild_id = ?
    `,
    )
    .get(guild.id);

  if (!config?.modlog_channel) return;

  const channel = guild.channels.cache.get(config.modlog_channel);

  if (!channel) return;

  await channel.send({
    embeds: [embed],
  });
};
