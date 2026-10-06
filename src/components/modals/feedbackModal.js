module.exports = {
  customId: "feedback_modal",

  async execute(interaction) {
    const feedback = interaction.fields.getTextInputValue("feedback_input");

    await interaction.reply({
      content: `Feedback diterima:\n${feedback}`,
      ephemeral: true,
    });
  },
};
