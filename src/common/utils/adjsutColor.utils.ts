"use client";

function adjustColor(color: string, amount = 0) {
  const num = parseInt(color.replace("#", ""), 16);

  let r = num >> 16;
  let g = (num >> 8) & 0x00ff;
  let b = num & 0x0000ff;

  if (amount > 0) {
    // Blend with white for lighter tints
    // Using 310 so that the maximum amount used (300) produces ~96% white, 
    // avoiding the issue of generating pure #ffffff
    const p = Math.min(amount / 310, 0.96);
    r = Math.round(r + (255 - r) * p);
    g = Math.round(g + (255 - g) * p);
    b = Math.round(b + (255 - b) * p);
  } else if (amount < 0) {
    // Blend with black for darker shades
    // Using 150 as divisor so that -80 produces ~53% black
    const p = Math.min(Math.abs(amount) / 150, 0.96);
    r = Math.round(r * (1 - p));
    g = Math.round(g * (1 - p));
    b = Math.round(b * (1 - p));
  }

  // Ensure values are safely clamped between 0–255
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

export default adjustColor;