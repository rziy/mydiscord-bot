const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("voicelb")
    .setDescription("Lihat leaderboard voice activity"),

  async execute(interaction) {
    const leaderboard = db
      .prepare(
        `
        SELECT *
        FROM user_levels
        WHERE guild_id = ?
        ORDER BY voice_seconds DESC
        LIMIT 10
      `,
      )
      .all(interaction.guild.id);

    if (!leaderboard.length) {
      return interaction.reply({
        content: "❌ Belum ada data voice activity.",
      });
    }

    const lines = await Promise.all(
      leaderboard.map(async (user, index) => {
        const member = await interaction.guild.members
          .fetch(user.user_id)
          .catch(() => null);

        const name = member ? member.displayName : "Unknown User";

        const hours = Math.floor(user.voice_seconds / 3600);

        const minutes = Math.floor((user.voice_seconds % 3600) / 60);

        const medal =
          index === 0
            ? "🥇"
            : index === 1
              ? "🥈"
              : index === 2
                ? "🥉"
                : `#${index + 1}`;

        return `${medal} **${name}** • ${hours}h ${minutes}m`;
      }),
    );

    const embed = new EmbedBuilder()
      .setTitle("🎤 Voice Leaderboard")
      .setDescription(lines.join("\n"))
      .setColor("Purple")
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
    });
  },
  async prefixExecute(message) {
    const fakeInteraction = {
      guild: message.guild,

      async reply(data) {
        return message.reply(data);
      },
    };

    return this.execute(fakeInteraction);
  },
};
