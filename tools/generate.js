import { fal } from "@fal-ai/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));

if (!config.fal?.apiKey || config.fal.apiKey.startsWith("COLE_")) {
  console.error("ERRO: preencha tools/config.json -> fal.apiKey com sua chave fal.ai.");
  process.exit(1);
}

fal.config({ credentials: config.fal.apiKey });

const [, , promptArg, outNameArg] = process.argv;
if (!promptArg || !outNameArg) {
  console.error('Uso (dentro de /tools): npm run gen -- "<prompt>" <nome-do-arquivo.png>');
  process.exit(1);
}

const outDir = path.join(ROOT, config.output?.dir ?? "assets/images");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, outNameArg);

console.log(`Gerando imagem com ${config.fal.model}...`);
const result = await fal.subscribe(config.fal.model, {
  input: {
    prompt: promptArg,
    image_size: config.defaults?.imageSize ?? "landscape_4_3",
    num_images: config.defaults?.numImages ?? 1,
  },
  logs: false,
});

const url = result?.data?.images?.[0]?.url;
if (!url) {
  console.error("Sem URL de imagem na resposta:", JSON.stringify(result, null, 2));
  process.exit(1);
}

const res = await fetch(url);
const buf = Buffer.from(await res.arrayBuffer());
fs.writeFileSync(outPath, buf);
console.log(`OK -> ${path.relative(ROOT, outPath)}`);
