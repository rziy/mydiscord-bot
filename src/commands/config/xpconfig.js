const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const db = require("../../database/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("xpconfig")
    .setDescription("Konfigurasi sistem XP")

    .addStringOption((option) =>
      option
        .setName("setting")
        .setDescription("Setting yang ingin diubah")
        .setRequired(true)
        .addChoices(
          { name: "Enable", value: "enabled" },
          { name: "Min XP", value: "min_xp" },
          { name: "Max XP", value: "max_xp" },
          { name: "Cooldown", value: "cooldown" },
          { name: "Multiplier", value: "multiplier" },
          { name: "Max Level", value: "max_level" },
        ),
    )

    .addStringOption((option) =>
      option.setName("value").setDescription("Nilai baru").setRequired(true),
    )

    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const setting = interaction.options.getString("setting");

    const value = interaction.options.getString("value");

    let settings = db
      .prepare(
        `
        SELECT *
        FROM guild_level_settings
        WHERE guild_id = ?
      `,
      )
      .get(interaction.guild.id);

    if (!settings) {
      db.prepare(
        `
        INSERT INTO guild_level_settings (guild_id)
        VALUES (?)
      `,
      ).run(interaction.guild.id);
    }

    db.prepare(
      `
      UPDATE guild_level_settings
      SET ${setting} = ?
      WHERE guild_id = ?
    `,
    ).run(value, interaction.guild.id);

    await interaction.reply({
      content: `✅ **${setting}** diubah menjadi **${value}**`,
    });
  },
};
