import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const templatesDir = join(dirname(fileURLToPath(import.meta.url)), "templates");

export async function renderTemplate(
  name: string,
  vars: Record<string, string>,
): Promise<string> {
  let html = await readFile(join(templatesDir, `${name}.html`), "utf8");
  for (const [key, value] of Object.entries(vars)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }
  return html;
}
