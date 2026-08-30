import fs from "fs";
import path from "path";

const iconsDir = path.resolve("src/assets/icons");
const outputFile = path.resolve("src/lib/components/icon/icon-types.ts");

try {
  const files = fs.readdirSync(iconsDir);
  const iconNames = files
    .filter((file) => file.endsWith(".svg"))
    .map((file) => `"${path.parse(file).name}"`);

  const typeContent = `// Automatically generated. Do not modify.\nexport type IconName = ${iconNames.join(" | ") || "never"};\n`;

  fs.writeFileSync(outputFile, typeContent, {});
} catch (err) {
  console.error("Failed to generate icon types:", err.message);
}
