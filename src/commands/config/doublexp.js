const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("doublexp")
    .setDescription("Manage XP events")

    .addSubcommand((sub) =>
      sub
        .setName("start")
        .setDescription("Start XP event")
        .addNumberOption((option) =>
          option
            .setName("multiplier")
            .setDescription("XP multiplier")
            .setRequired(true),
        ),
    )

    .addSubcommand((sub) => sub.setName("stop").setDescription("Stop XP event"))

    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "start") {
      const multiplier = interaction.options.getNumber("multiplier");

      if (multiplier < 1) {
        return interaction.reply({
          content: "❌ Multiplier harus minimal 1.",
          ephemeral: true,
        });
      }

      db.prepare(
        `
        INSERT OR REPLACE INTO xp_events
        (guild_id, multiplier)
        VALUES (?, ?)
      `,
      ).run(interaction.guild.id, multiplier);

      return interaction.reply({
        content: `🚀 XP Event aktif: **${multiplier}x XP**`,
      });
    }

    if (sub === "stop") {
      db.prepare(
        `
        DELETE FROM xp_events
        WHERE guild_id = ?
      `,
      ).run(interaction.guild.id);

      return interaction.reply({
        content: "🛑 XP Event dihentikan.",
      });
    }
  },
};
