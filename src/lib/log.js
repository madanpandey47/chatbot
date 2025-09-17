import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "logs.json");

export function logEvent(event) {
  try {
    const existing = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : [];
    existing.push({ at: new Date().toISOString(), ...event });
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
  } catch (e) {
    // ignore in local-only mode
  }
}


