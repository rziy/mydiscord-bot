const { Events } = require("discord.js");
const db = require("../../database/db");

module.exports = {
  name: Events.VoiceStateUpdate,

  async execute(oldState, newState) {
    const member = newState.member;

    if (!member || member.user.bot) return;

    // Join VC
    if (!oldState.channel && newState.channel) {
      db.prepare(
        `
        INSERT OR REPLACE INTO voice_sessions
        (guild_id, user_id, joined_at)
        VALUES (?, ?, ?)
      `,
      ).run(member.guild.id, member.id, Date.now());

      console.log(`[VOICE JOIN] ${member.user.tag}`);
    }

    // Leave VC
    if (oldState.channel && !newState.channel) {
      db.prepare(
        `
        DELETE FROM voice_sessions
        WHERE guild_id = ?
        AND user_id = ?
      `,
      ).run(member.guild.id, member.id);

      console.log(`[VOICE LEAVE] ${member.user.tag}`);
    }
  },
};
