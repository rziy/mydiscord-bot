const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Kirim panel bantuan tiket ke channel ini')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('judul')
                .setDescription('Judul panel tiket')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('deskripsi')
                .setDescription('Deskripsi panel tiket')
                .setRequired(false)),

    async execute(interaction) {
        const title = interaction.options.getString('judul') || 'Ticket Support Server';
        const description = interaction.options.getString('deskripsi') || 'Klik tombol di bawah untuk membuka tiket bantuan privat dengan Staff / Admin.';

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(0x5865F2)
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const button = new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('?? Buka Tiket')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.channel.send({ embeds: [embed], components: [row] });
        return interaction.reply({ content: '? Panel tiket berhasil dikirim!', flags: MessageFlags.Ephemeral });
    }
};
