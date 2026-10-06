const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Menampilkan menu bantuan perintah bot interaktif'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('?? Menu Bantuan Bot')
            .setDescription('Pilih kategori di menu dropdown di bawah untuk melihat daftar perintah lengkap!')
            .setColor(0x5865F2)
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_category')
            .setPlaceholder('?? Pilih Kategori Perintah...')
            .addOptions([
                { label: '?? Config', description: 'Pengaturan XP, Welcome, Autorole, Title', value: 'help_config' },
                { label: '?? Leveling', description: 'Rank, Leaderboard, Voice Activity', value: 'help_leveling' },
                { label: '??? Moderation', description: 'Warn, Ban, Lock, Purge, AutoMod', value: 'help_moderation' },
                { label: '??? Utility', description: 'Ticket, Bot Info, Server Stats, Avatar', value: 'help_utility' },
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};
