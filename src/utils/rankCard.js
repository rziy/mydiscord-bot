const { createCanvas, loadImage } = require("canvas");

async function generateRankCard({
  avatarURL,
  username,
  title,
  level,
  rank,
  xp,
  requiredXP,
  messages,
  voiceTime,
}) {
  requiredXP ||= 100;
  xp ||= 0;

  const width = 850;
  const height = 260;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  const bg = ctx.createLinearGradient(0, 0, width, height);

  bg.addColorStop(0, "#4c3a2d");
  bg.addColorStop(1, "#6b5645");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Avatar container
  ctx.fillStyle = "#ffffff20";

  roundRect(ctx, 15, 15, 110, 110, 12);
  ctx.fill();

  // Avatar
  const avatar = await loadImage(avatarURL);

  ctx.save();

  roundRect(ctx, 15, 15, 110, 110, 12);
  ctx.clip();

  ctx.drawImage(avatar, 15, 15, 110, 110);

  ctx.restore();

  // Username
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 40px Sans";
  ctx.fillText(username, 145, 95);

  // Title
  ctx.fillStyle = "#d7c3a5";
  ctx.font = "24px Sans";
  ctx.fillText(`✦ ${title}`, 145, 125);

  // Level badge
  drawBadge(ctx, 15, 145, 110, 42, `LVL ${level}`);

  // Rank badge
  drawBadge(ctx, 140, 145, 270, 42, `#${rank}`, "#8b5cf6");

  // Stats
  ctx.fillStyle = "#ffffff";
  ctx.font = "18px Sans";

  ctx.fillText(`💬 ${messages} Messages`, 520, 95);

  ctx.fillText(`🎤 ${voiceTime}`, 520, 125);

  // Progress bar
  const barX = 140;
  const barY = 198;
  const barWidth = 650;
  const barHeight = 40;

  roundRect(ctx, barX, barY, barWidth, barHeight, 18);

  ctx.fillStyle = "#222";
  ctx.fill();

  const progress = Math.max(0, Math.min(xp / requiredXP, 1));

  const progressWidth = barWidth * progress;

  roundRect(ctx, barX, barY, progressWidth, barHeight, 18);

  ctx.fillStyle = "#14b88f";
  ctx.fill();

  // XP text center
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px Sans";

  const progressText = `${xp} / ${requiredXP} XP`;

  const textWidth = ctx.measureText(progressText).width;

  ctx.fillText(progressText, barX + (barWidth - textWidth) / 2, barY + 27);

  return canvas.toBuffer("image/png");
}

function drawBadge(ctx, x, y, width, height, text, borderColor = "#d4d4d4") {
  roundRect(ctx, x, y, width, height, 14);

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "bold 22px Sans";

  const textWidth = ctx.measureText(text).width;

  ctx.fillText(text, x + (width - textWidth) / 2, y + 28);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();

  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);

  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);

  ctx.lineTo(x + width, y + height - radius);

  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);

  ctx.lineTo(x + radius, y + height);

  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);

  ctx.lineTo(x, y + radius);

  ctx.quadraticCurveTo(x, y, x + radius, y);

  ctx.closePath();
}

module.exports = {
  generateRankCard,
};
