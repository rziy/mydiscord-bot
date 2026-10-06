const { SlashCommandBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');
const fs = require('fs');
const db = require('../../database/db');

// Daftarkan Font Kustom
GlobalFonts.registerFromPath(path.join(__dirname, '../../assets/Aston Script.ttf'), 'AstonScript');
GlobalFonts.registerFromPath(path.join(__dirname, '../../assets/coolvetica rg.ttf'), 'CoolveticaFont');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Lihat kartu ID simpel ala NewJeans')
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('Member yang ingin dicek')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply();

        const target = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(target.id);

        // 1. Hitung Rank Otomatis dari Database
        const allLevels = global.db?.prepare('SELECT * FROM levels WHERE guildId = ? ORDER BY xp DESC').all(interaction.guild.id) || [];
        const userIndex = allLevels.findIndex(u => u.userId === target.id);
        const userRank = userIndex !== -1 ? `#${userIndex + 1}` : '#-';

        const userLevel = allLevels[userIndex] || { xp: 0, level: 0 };
        const currentXP = userLevel.xp || 0;
        const level = userLevel.level || 0;
        const neededXP = (level + 1) * 100;

        // 2. Ambil Role Tertinggi
        const topRole = member.roles.highest.name !== '@everyone' ? member.roles.highest.name.toUpperCase() : 'MEMBER';

        // 3. Ambil Background Active dari Database
        let userEco = null;
        try {
            userEco = db.prepare('SELECT equipped_bg FROM user_economy WHERE user_id = ? AND guild_id = ?').get(target.id, interaction.guild.id);
        } catch (e) {
            console.error('Error fetching equipped_bg:', e);
        }
        const equippedBg = userEco ? userEco.equipped_bg : 'default';

        try {
            const canvas = createCanvas(900, 600);
            const ctx = canvas.getContext('2d');

            // 4. Render Background
            let loadedCustomBg = false;
            if (equippedBg && equippedBg !== 'default') {
                const bgDir = path.join(__dirname, '../../assets/backgrounds/');
                if (fs.existsSync(bgDir)) {
                    const files = fs.readdirSync(bgDir);
                    const matchedFile = files.find(f => path.parse(f).name.toLowerCase() === equippedBg.toLowerCase());
                    if (matchedFile) {
                        try {
                            const bgImage = await loadImage(path.join(bgDir, matchedFile));
                            ctx.drawImage(bgImage, 0, 0, 900, 600);
                            loadedCustomBg = true;
                        } catch (err) {
                            console.error('Gagal memuat background kustom:', err);
                        }
                    }
                }
            }

            if (!loadedCustomBg) {
                const bgGrad = ctx.createLinearGradient(0, 0, 0, 600);
                bgGrad.addColorStop(0, '#BEE3F8');
                bgGrad.addColorStop(1, '#EBF8FF');
                ctx.fillStyle = bgGrad;
                ctx.fillRect(0, 0, 900, 600);
            }

            // Box Kartu Putih
            ctx.fillStyle = loadedCustomBg ? 'rgba(255, 255, 255, 0.88)' : '#FFFFFF';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(70, 50, 760, 500, 16);
            ctx.fill();
            ctx.stroke();

            // Header Title
            const titleStartX = 110;
            const titleStartY = 110;

            ctx.font = 'bold 42px "AstonScript"';
            ctx.fillStyle = '#1A202C';
            ctx.fillText('C', titleStartX, titleStartY);

            const cWidth = ctx.measureText('C').width;

            ctx.font = 'bold 30px "CoolveticaFont"';
            ctx.fillStyle = '#1A202C';
            ctx.fillText('LOCKWYRD', titleStartX + cWidth - 2, titleStartY);

            // Right Info ID
            ctx.font = '18px "CoolveticaFont"';
            ctx.fillStyle = '#2D3748';
            ctx.textAlign = 'right';
            ctx.fillText('ID CARD', 790, 100);

            let memberID = '';
            const OWNER_ID = '921676986814963753';

            if (target.id === OWNER_ID || target.id === interaction.guild.ownerId) {
                memberID = 'OWNER';
            } else {
                const members = await interaction.guild.members.fetch();
                const sortedMembers = Array.from(members.values())
                    .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
                
                const joinIndex = sortedMembers.findIndex(m => m.id === target.id) + 1;
                memberID = `ID. ${joinIndex.toString().padStart(4, '0')}`;
            }

            ctx.font = '16px "CoolveticaFont"';
            ctx.fillText(memberID, 790, 125);
            ctx.textAlign = 'left';

            // Garis Header
            ctx.strokeStyle = '#E2E8F0';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(110, 140);
            ctx.lineTo(790, 140);
            ctx.stroke();

            // Avatar Box
            const avatar = await loadImage(target.displayAvatarURL({ extension: 'png', size: 512 }));
            ctx.drawImage(avatar, 110, 165, 230, 230);
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(110, 165, 230, 230);

            // Role Badge Box
            ctx.fillStyle = '#1A202C';
            ctx.beginPath();
            ctx.roundRect(110, 405, 230, 28, 6);
            ctx.fill();

            ctx.font = '13px "CoolveticaFont"';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(`${topRole}`, 225, 423);
            ctx.textAlign = 'left';

            // Data Fields
            const fields = [
                { label: 'Name', value: target.displayName },
                { label: 'Level', value: `LVL ${level}` },
                { label: 'Rank', value: userRank },
                { label: 'XP', value: `${currentXP} / ${neededXP}` },
                { label: 'Joined', value: member.joinedAt ? member.joinedAt.toLocaleDateString('id-ID') : 'Member' }
            ];

            let startY = 190;
            fields.forEach(field => {
                ctx.font = 'bold 18px "CoolveticaFont"';
                ctx.fillStyle = '#1A202C';
                ctx.fillText(field.label, 380, startY);

                ctx.font = '18px "CoolveticaFont"';
                ctx.fillStyle = '#4A5568';
                ctx.textAlign = 'right';
                ctx.fillText(field.value, 790, startY);
                ctx.textAlign = 'left';

                ctx.strokeStyle = '#CBD5E0';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(380, startY + 12);
                ctx.lineTo(790, startY + 12);
                ctx.stroke();
                ctx.setLineDash([]);

                startY += 45;
            });

            // Watermark
            ctx.font = 'italic 13px "CoolveticaFont"';
            ctx.fillStyle = '#718096';
            ctx.fillText('verified clockwyrd member.', 110, 455);

            // Attachment & Tombol Close
            const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'nj-rank.png' });

            const closeButton = new ButtonBuilder()
                .setCustomId('close_rank_card')
                .setLabel('Tutup')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️');

            const row = new ActionRowBuilder().addComponents(closeButton);

            const response = await interaction.editReply({ files: [attachment], components: [row] });

            const collector = response.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'close_rank_card') {
                    if (i.user.id !== interaction.user.id) {
                        return i.reply({ content: 'Hanya pemanggil perintah yang bisa menutup!', ephemeral: true });
                    }
                    await interaction.deleteReply().catch(() => {});
                }
            });

            collector.on('end', async () => {
                await interaction.editReply({ components: [] }).catch(() => {});
            });

        } catch (err) {
            console.error('Error Rank Command:', err);
            return interaction.editReply({ content: `📊 **${target.username}** | Level: **${level}** | XP: **${currentXP}/${neededXP}**` });
        }
    }
};