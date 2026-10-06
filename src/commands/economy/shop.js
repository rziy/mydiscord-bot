const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    AttachmentBuilder 
} = require('discord.js');
const path = require('path');
const fs = require('fs');
const db = require('../../database/db');

const OWNER_ID = '921676986814963753';

function getAutoShopItems() {
    const bgDir = path.join(__dirname, '../../assets/backgrounds/');
    if (!fs.existsSync(bgDir)) return [];

    const files = fs.readdirSync(bgDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

    return files.map(file => {
        const rawName = path.parse(file).name;
        const formattedName = rawName
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

        return {
            id: rawName.toLowerCase(),
            name: formattedName,
            price: 500,
            filename: file,
            desc: `Background ID Card tema ${formattedName}.`
        };
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Buka katalog toko background ID Card'),

    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const isOwner = userId === OWNER_ID;

        const shopItems = getAutoShopItems();

        if (shopItems.length === 0) {
            return interaction.editReply({ content: '❌ Belum ada gambar background di folder `src/assets/backgrounds/`!' });
        }

        let userEco = db.prepare('SELECT * FROM user_economy WHERE user_id = ? AND guild_id = ?').get(userId, guildId);
        if (!userEco) {
            db.prepare('INSERT INTO user_economy (user_id, guild_id, coins) VALUES (?, ?, ?)').run(userId, guildId, 1000);
            userEco = { user_id: userId, guild_id: guildId, coins: 1000, equipped_bg: 'default' };
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_shop_item')
            .setPlaceholder('Pilih background untuk lihat preview Banner...')
            .addOptions(
                shopItems.map(item => ({
                    label: item.name,
                    description: isOwner ? '👑 Gratis (Owner Pass)' : `💰 Harga: ${item.price} Coins`,
                    value: item.id
                }))
            );

        const closeButton = new ButtonBuilder()
            .setCustomId('close_shop')
            .setLabel('Tutup Katalog')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🗑️');

        const menuRow = new ActionRowBuilder().addComponents(selectMenu);
        const actionRow = new ActionRowBuilder().addComponents(closeButton);

        const embed = new EmbedBuilder()
            .setTitle('🛒 CLOCKWYRD BACKGROUND SHOP')
            .setDescription(`Pilih background di bawah untuk preview banner!\n\n💰 Saldo Kamu: **${userEco.coins} Coins**${isOwner ? ' *(Owner Status: Active)*' : ''}`)
            .setColor('#BEE3F8');

        const response = await interaction.editReply({ 
            embeds: [embed], 
            components: [menuRow, actionRow] 
        });

        const collector = response.createMessageComponentCollector({ time: 120000 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: 'Ini katalog milik pengguna lain!', ephemeral: true });
            }

            if (i.customId === 'close_shop') {
                collector.stop('user_closed');
                return interaction.deleteReply().catch(() => {});
            }

            if (i.isStringSelectMenu()) {
                const selectedId = i.values[0];
                const selectedItem = shopItems.find(item => item.id === selectedId);

                const hasItem = db.prepare('SELECT * FROM user_inventory WHERE user_id = ? AND guild_id = ? AND bg_id = ?').get(userId, guildId, selectedId);

                const bannerPath = path.join(__dirname, '../../assets/backgrounds/', selectedItem.filename);
                const hasImageFile = fs.existsSync(bannerPath);

                const buyButton = new ButtonBuilder()
                    .setCustomId(`buy_${selectedItem.id}`)
                    .setLabel(hasItem ? 'Sudah Dimiliki' : (isOwner ? '🎁 Klaim Gratis (Owner)' : `Beli (${selectedItem.price} Coins)`))
                    .setStyle(hasItem ? ButtonStyle.Secondary : (isOwner ? ButtonStyle.Primary : ButtonStyle.Success))
                    .setDisabled(Boolean(hasItem));

                const buttonRow = new ActionRowBuilder().addComponents(buyButton, closeButton);

                const previewEmbed = new EmbedBuilder()
                    .setTitle(`🎨 Preview: ${selectedItem.name}`)
                    .setDescription(`${selectedItem.desc}\n\nStatus: ${hasItem ? '✅ Sudah Kamu Miliki' : (isOwner ? '👑 **Akses Gratis Khusus Owner**' : `💰 Harga: **${selectedItem.price} Coins**`)}`)
                    .setColor('#2B6CB0');

                if (hasImageFile) {
                    const bannerAttachment = new AttachmentBuilder(bannerPath, { name: 'banner.png' });
                    previewEmbed.setImage('attachment://banner.png');
                    await i.update({ embeds: [previewEmbed], files: [bannerAttachment], components: [menuRow, buttonRow] });
                } else {
                    await i.update({ embeds: [previewEmbed], files: [], components: [menuRow, buttonRow] });
                }
            }

            if (i.isButton() && i.customId.startsWith('buy_')) {
                const itemId = i.customId.replace('buy_', '');
                const itemToBuy = shopItems.find(item => item.id === itemId);

                const currentEco = db.prepare('SELECT coins FROM user_economy WHERE user_id = ? AND guild_id = ?').get(userId, guildId);

                if (!isOwner && currentEco.coins < itemToBuy.price) {
                    return i.reply({ content: `❌ Coins kamu kurang! Kamu butuh **${itemToBuy.price} Coins**, saldo kamu sekarang: **${currentEco.coins} Coins**.`, ephemeral: true });
                }

                if (!isOwner) {
                    db.prepare('UPDATE user_economy SET coins = coins - ? WHERE user_id = ? AND guild_id = ?').run(itemToBuy.price, userId, guildId);
                }

                db.prepare('INSERT OR IGNORE INTO user_inventory (guild_id, user_id, bg_id) VALUES (?, ?, ?)').run(guildId, userId, itemId);

                await i.reply({ content: `🎉 ${isOwner ? '👑 **[Owner Pass]** ' : ''}Selamat! Kamu berhasil mendapatkan background **${itemToBuy.name}**! Gunakan \`/set-bg\` untuk memasangnya.`, ephemeral: true });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason !== 'user_closed') {
                interaction.editReply({ components: [] }).catch(() => {});
            }
        });
    }
};