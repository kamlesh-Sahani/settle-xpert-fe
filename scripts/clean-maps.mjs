import fs from "fs";
import path from "path";

function removeMaps(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removeMaps(fullPath);
    } else if (entry.name.endsWith(".map")) {
      fs.unlinkSync(fullPath);
    }
  }
}

removeMaps(".next");
console.log("✓ Stripped .map source maps from .next build output.");
