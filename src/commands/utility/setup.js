const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Panduan setup bot"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("⚙️ Setup Guide")

      .addFields(
        {
          name: "📈 Leveling",
          value: "`/xpconfig`\n`/setreward`\n`/settitle`\n`/setlevelup`",
        },
        {
          name: "👋 Welcome",
          value: "`/setwelcome`\n`/togglewelcome`\n`/testwelcome`",
        },
        {
          name: "🛡️ Moderation",
          value: "`/automod`\n`/setmodlog`\n`/addbadword`",
        },
        {
          name: "🎁 Auto Role",
          value: "`/setautorole`\n`/removeautorole`",
        },
      );

    await interaction.reply({
      embeds: [embed],
    });
  },
};
