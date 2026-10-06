const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Tampilkan foto profil (avatar) pengguna dalam ukuran penuh')
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('Member yang ingin dilihat avatar-nya')
                .setRequired(false)),

    async execute(interaction) {
        const user = interaction.options.getUser('target') || interaction.user;
        const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const embed = new EmbedBuilder()
            .setTitle(`??? Avatar - ${user.username}`)
            .setImage(avatarUrl)
            .setColor(0x5865F2)
            .setTimestamp();

        const button = new ButtonBuilder()
            .setLabel('Buka di Browser')
            .setStyle(ButtonStyle.Link)
            .setURL(avatarUrl);

        const row = new ActionRowBuilder().addComponents(button);

        return interaction.reply({ embeds: [embed], components: [row] });
    }
};
