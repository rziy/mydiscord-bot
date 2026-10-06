const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("automod")
    .setDescription("Configure AutoMod")

    .addSubcommand((sub) =>
      sub
        .setName("links")
        .setDescription("Toggle anti links")
        .addBooleanOption((o) =>
          o.setName("enabled").setDescription("On or Off").setRequired(true),
        ),
    )

    .addSubcommand((sub) =>
      sub
        .setName("mentions")
        .setDescription("Configure mention spam")
        .addIntegerOption((o) =>
          o.setName("limit").setDescription("Max mentions").setRequired(true),
        ),
    )

    .addSubcommand((sub) =>
      sub
        .setName("spam")
        .setDescription("Configure spam protection")
        .addIntegerOption((o) =>
          o
            .setName("limit")
            .setDescription("Messages before trigger")
            .setRequired(true),
        ),
    )

    .addSubcommand((sub) =>
      sub
        .setName("caps")
        .setDescription("Configure anti caps")
        .addIntegerOption((o) =>
          o.setName("percent").setDescription("Percentage").setRequired(true),
        ),
    )

    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildId = interaction.guild.id;

    db.prepare(
      `
      INSERT OR IGNORE INTO automod_settings (guild_id)
      VALUES (?)
    `,
    ).run(guildId);

    const sub = interaction.options.getSubcommand();

    if (sub === "links") {
      const enabled = interaction.options.getBoolean("enabled");

      db.prepare(
        `
        UPDATE automod_settings
        SET anti_links = ?
        WHERE guild_id = ?
      `,
      ).run(enabled ? 1 : 0, guildId);

      return interaction.reply({
        content: `✅ Anti Links ${enabled ? "Enabled" : "Disabled"}`,
      });
    }

    if (sub === "mentions") {
      const limit = interaction.options.getInteger("limit");

      db.prepare(
        `
        UPDATE automod_settings
        SET anti_mentions = 1,
            mention_limit = ?
        WHERE guild_id = ?
      `,
      ).run(limit, guildId);

      return interaction.reply({
        content: `✅ Mention limit set to ${limit}`,
      });
    }

    if (sub === "spam") {
      const limit = interaction.options.getInteger("limit");

      db.prepare(
        `
        UPDATE automod_settings
        SET anti_spam = 1,
            spam_limit = ?
        WHERE guild_id = ?
      `,
      ).run(limit, guildId);

      return interaction.reply({
        content: `✅ Spam limit set to ${limit}`,
      });
    }

    if (sub === "caps") {
      const percent = interaction.options.getInteger("percent");

      db.prepare(
        `
        UPDATE automod_settings
        SET anti_caps = 1,
            caps_percent = ?
        WHERE guild_id = ?
      `,
      ).run(percent, guildId);

      return interaction.reply({
        content: `✅ Caps limit set to ${percent}%`,
      });
    }
  },
};
