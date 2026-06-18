(function (global) {
  "use strict";

  function drawHorse(ctx, x, y, scale, angle) {
    ctx.save();
    ctx.translate(x, y);

    const needFlip = Math.abs(angle) > Math.PI / 2 && Math.abs(angle) < Math.PI * 3 / 2;
    if (needFlip) {
      ctx.rotate(angle + Math.PI);
      ctx.scale(-1, 1);
    } else {
      ctx.rotate(angle);
    }
    ctx.scale(scale, scale);

    const ink = "#2C1810";
    const accent = "#8B2500";

    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(-8, 2);
    ctx.bezierCurveTo(-6, -2, -2, -5, 4, -5);
    ctx.bezierCurveTo(8, -5, 11, -3, 13, 0);
    ctx.bezierCurveTo(14, 2, 13, 4, 11, 5);
    ctx.lineTo(10, 10);
    ctx.lineTo(8, 10);
    ctx.lineTo(9, 6);
    ctx.lineTo(7, 6);
    ctx.lineTo(8, 10);
    ctx.lineTo(6, 10);
    ctx.lineTo(5, 6);
    ctx.lineTo(-2, 6);
    ctx.lineTo(-1, 10);
    ctx.lineTo(-3, 10);
    ctx.lineTo(-4, 6);
    ctx.lineTo(-6, 6);
    ctx.lineTo(-5, 10);
    ctx.lineTo(-7, 10);
    ctx.lineTo(-8, 5);
    ctx.bezierCurveTo(-10, 4, -11, 2, -8, 2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(13, 0);
    ctx.bezierCurveTo(15, -3, 17, -7, 18, -9);
    ctx.bezierCurveTo(19, -11, 21, -12, 22, -11);
    ctx.bezierCurveTo(23, -10, 23, -8, 22, -7);
    ctx.lineTo(20, -6);
    ctx.bezierCurveTo(19, -5, 17, -3, 15, -1);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(21, -12);
    ctx.lineTo(20, -15);
    ctx.lineTo(22, -13);
    ctx.fill();

    ctx.fillStyle = "#F5F0E8";
    ctx.beginPath();
    ctx.arc(21, -9, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = ink;
    ctx.lineCap = "round";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-9, 2);
    ctx.bezierCurveTo(-13, 0, -16, -2, -18, -4);
    ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-9, 3);
    ctx.bezierCurveTo(-14, 2, -17, 0, -19, -2);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(14, -4);
    ctx.bezierCurveTo(12, -7, 10, -8, 8, -7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12, -3);
    ctx.bezierCurveTo(10, -6, 8, -7, 6, -6);
    ctx.stroke();

    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(2, -5);
    ctx.bezierCurveTo(1, -9, 2, -13, 3, -15);
    ctx.lineTo(5, -15);
    ctx.bezierCurveTo(6, -13, 7, -9, 6, -5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(4, -17, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(-2, -22);
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(-2, -22);
    ctx.lineTo(-12, -19);
    ctx.lineTo(-10, -17);
    ctx.lineTo(-2, -18);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-12, -19);
    ctx.lineTo(-14, -17);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-11, -18);
    ctx.lineTo(-13, -16);
    ctx.stroke();

    ctx.restore();
  }

  function drawShip(ctx, x, y, scale, angle) {
    ctx.save();
    ctx.translate(x, y);

    const needFlip = Math.abs(angle) > Math.PI / 2 && Math.abs(angle) < Math.PI * 3 / 2;
    if (needFlip) {
      ctx.rotate(angle + Math.PI);
      ctx.scale(-1, 1);
    } else {
      ctx.rotate(angle);
    }
    ctx.scale(scale, scale);

    const ink = "#2C1810";
    const accent = "#8B2500";
    const wood = "#5C4033";

    ctx.fillStyle = wood;
    ctx.beginPath();
    ctx.moveTo(-18, 2);
    ctx.bezierCurveTo(-16, 6, -8, 9, 0, 9);
    ctx.bezierCurveTo(8, 9, 16, 6, 20, 2);
    ctx.lineTo(22, -1);
    ctx.lineTo(18, 0);
    ctx.lineTo(-16, 0);
    ctx.lineTo(-20, -2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    ctx.moveTo(-15, 3);
    ctx.bezierCurveTo(-8, 5, 8, 5, 17, 3);
    ctx.stroke();

    ctx.fillStyle = wood;
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-20, -2);
    ctx.lineTo(-19, -6);
    ctx.lineTo(-15, -3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(22, -1);
    ctx.lineTo(24, -4);
    ctx.lineTo(20, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.lineTo(2, -22);
    ctx.stroke();

    ctx.fillStyle = "#E8DCC8";
    ctx.strokeStyle = ink;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(2, -20);
    ctx.lineTo(14, -18);
    ctx.lineTo(14, -4);
    ctx.lineTo(2, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    for (let i = 1; i <= 4; i += 1) {
      const t = i / 5;
      const sy = -20 + t * 18;
      const ey = -18 + t * 14;
      ctx.beginPath();
      ctx.moveTo(2, sy);
      ctx.lineTo(14, ey);
      ctx.stroke();
    }

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(2, -22);
    ctx.lineTo(-6, -20);
    ctx.lineTo(-5, -18.5);
    ctx.lineTo(2, -19.5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = accent;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-6, -20);
    ctx.lineTo(-8, -19);
    ctx.stroke();

    ctx.strokeStyle = "rgba(120, 160, 180, 0.3)";
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(-22, 6);
    ctx.bezierCurveTo(-14, 8, 6, 10, 24, 6);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  const TRANSPORT_ICONS = {
    drawHorse,
    drawShip,
  };

  global.TRANSPORT_ICONS = TRANSPORT_ICONS;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { TRANSPORT_ICONS };
  }
})(typeof window !== "undefined" ? window : globalThis);
