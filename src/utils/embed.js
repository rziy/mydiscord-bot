const { EmbedBuilder } = require("discord.js");

module.exports = ({ title, description, color = "#5865F2" }) => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
};
