const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    MessageFlags 
} = require('discord.js');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-bg')
        .setDescription('Pilih dan pasang background ID Card dari inventory kamu'),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // 1. Ambil semua background yang dimiliki user dari Database
        const userInventory = db.prepare('SELECT bg_id FROM user_inventory WHERE user_id = ? AND guild_id = ?').all(userId, guildId);

        // Buat daftar opsi (selalu masukkan opsi 'default')
        const ownedItems = [{ bg_id: 'default' }, ...userInventory];

        // Format pilihan untuk Dropdown Menu
        const options = ownedItems.map(item => {
            const formattedName = item.bg_id
                .replace(/[-_]/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());

            return {
                label: formattedName,
                description: item.bg_id === 'default' ? 'Background bawaan sistem' : `ID: ${item.bg_id}`,
                value: item.bg_id
            };
        });

        // 2. Buat Select Menu Dropdown
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_equipped_bg')
            .setPlaceholder('Pilih background yang ingin dipasang...')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setTitle('🖼️ Equipping ID Card Background')
            .setDescription('Pilih salah satu background dari koleksi milikmu di bawah ini untuk langsung dipasang:')
            .setColor('#2B6CB0');

        const response = await interaction.editReply({ embeds: [embed], components: [row] });

        // 3. Collector untuk menangkap pilihan user
        const collector = response.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) return;

            if (i.isStringSelectMenu()) {
                const selectedBg = i.values[0];

                // Update background terpilih di Database
                db.prepare(`
                    INSERT INTO user_economy (user_id, guild_id, equipped_bg) 
                    VALUES (?, ?, ?) 
                    ON CONFLICT(guild_id, user_id) 
                    DO UPDATE SET equipped_bg = ?
                `).run(userId, guildId, selectedBg, selectedBg);

                await i.update({
                    content: `✅ Success! Background ID Card kamu berhasil diubah ke **${selectedBg}**!`,
                    embeds: [],
                    components: []
                });
            }
        });
    }
};
