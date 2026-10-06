const db = require("../database/db");
const { addXP } = require("../utils/xpManager");
const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,

  execute(client) {
    console.log(`${client.user.tag} online!`);

    const statuses = [
      "🛡️ Moderating servers",
      `.help ${client.guilds.cache.size} servers rn!`,
      "⚡ Utility & Moderation",
      "https://discord.gg/KsbuavfTwf",
      "Saint Hostel Official Bot",
    ];

    let index = 0;

    // Status Loop
    setInterval(() => {
      client.user.setPresence({
        activities: [
          {
            name: statuses[index],
            type: ActivityType.Streaming,
            url: "https://www.twitch.tv/raiyv",
          },
        ],
        status: "online",
      });

      index++;

      if (index >= statuses.length) {
        index = 0;
      }
    }, 10000);

    // Voice XP Loop
    setInterval(async () => {
      const sessions = db
        .prepare(
          `
          SELECT *
          FROM voice_sessions
        `,
        )
        .all();

      for (const session of sessions) {
        const settings = db
          .prepare(
            `
            SELECT *
            FROM guild_level_settings
            WHERE guild_id = ?
          `,
          )
          .get(session.guild_id);

        if (!settings?.voice_enabled) continue;

        const guild = client.guilds.cache.get(session.guild_id);

        if (!guild) continue;

        const member = await guild.members
          .fetch(session.user_id)
          .catch(() => null);

        if (!member) continue;

        const voice = member.voice;

        if (!voice.channel) continue;

        // Anti AFK Channel
        if (
          settings.voice_anti_afk &&
          guild.afkChannelId &&
          voice.channel.id === guild.afkChannelId
        ) {
          continue;
        }

        // Anti Self Mute
        if (voice.selfMute) continue;

        // Anti Self Deaf
        if (voice.selfDeaf) continue;

        const realMembers = voice.channel.members.filter(
          (m) => !m.user.bot && !m.voice.selfDeaf,
        );

        if (realMembers.size < (settings.voice_min_members ?? 2)) {
          continue;
        }

        const minXP = settings.voice_min_xp ?? 10;

        const maxXP = settings.voice_max_xp ?? 20;

        let xp = Math.floor(Math.random() * (maxXP - minXP + 1)) + minXP;

        const event = db
          .prepare(
            `
    SELECT *
    FROM xp_events
    WHERE guild_id = ?
  `,
          )
          .get(session.guild_id);

        if (event) {
          xp = Math.floor(xp * event.multiplier);
        }
        addXP(session.guild_id, session.user_id, xp);

        // Tambah voice time
        db.prepare(
          `
          UPDATE user_levels
          SET voice_seconds =
              voice_seconds + 60
          WHERE guild_id = ?
          AND user_id = ?
        `,
        ).run(session.guild_id, session.user_id);

        console.log(`[VOICE XP] ${member.user.tag} +${xp} XP`);
      }
    }, 60000);
  },
};
