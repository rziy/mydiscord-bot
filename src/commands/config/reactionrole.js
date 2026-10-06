const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Buat pesan interaktif untuk tombol pembagi role')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('Role yang akan diberikan/dilepas')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('label')
                .setDescription('Teks tombol (contoh: "Ambil Role Gamer")')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('deskripsi')
                .setDescription('Deskripsi pesan embed (Opsional)')
                .setRequired(false)),

    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const label = interaction.options.getString('label');
        const description = interaction.options.getString('deskripsi') || `Klik tombol di bawah untuk mengambil atau melepas role **${role.name}**.`;

        if (role.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({ 
                content: '? Posisi role tersebut sama/lebih tinggi dari role bot. Pindahkan role bot ke posisi lebih atas!', 
                ephemeral: true 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('?? Self Role Assignment')
            .setDescription(description)
            .setColor(role.color || 0x5865F2)
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const button = new ButtonBuilder()
            .setCustomId(`rr_${role.id}`)
            .setLabel(label)
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.channel.send({ embeds: [embed], components: [row] });
        return interaction.reply({ content: '? Menu Reaction Role berhasil dibuat!', ephemeral: true });
    }
};
