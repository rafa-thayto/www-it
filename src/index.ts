import "dotenv/config";
import { AES, enc, mode, pad } from "crypto-js";
import xlsx from "node-xlsx";
import fs from "fs";
import { z } from "zod";

const envSchema = z.object({
  CRYPTO_KEY: z.string(),
  CRYPTO_IV: z.string(),
});

const env = envSchema.parse(process.env);

const CRYPTO_KEY = env.CRYPTO_KEY;
const CRYPTO_IV = env.CRYPTO_IV;

const encrypt = (value: string) => {
  const key = enc.Utf8.parse(CRYPTO_KEY);
  const iv = enc.Utf8.parse(CRYPTO_IV);

  const encrypted = AES.encrypt(value, key, {
    iv,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  });

  return encrypted.toString();
};

const decrypt = (value: string) => {
  const key = enc.Utf8.parse(CRYPTO_KEY);
  const iv = enc.Utf8.parse(CRYPTO_IV);

  const decrypted = AES.decrypt(value, key, {
    iv,
    mode: mode.CBC,
    padding: pad.Pkcs7,
  });

  return decrypted.toString(enc.Utf8);
};

import { Command } from "commander";
import figlet from "figlet";

const program = new Command();

console.log(figlet.textSync("What's Wrong With It"));

const readXlsxFile = (path: string) => {
  const data = xlsx.parse(fs.readFileSync(path), { type: "buffer" });
  const result = data[0].data
    .filter(
      (item, index) =>
        !(item[0] === undefined && item[2] === undefined) && index > 0,
    )
    .map((item) => {
      return {
        cnpj: item[0],
        cpf: item[2],
      };
    });
  return result;
};

program
  .version("0.0.1")
  .description("An example CLI for managing a directory")
  .option("-xlsx, --xlsx <path>", "Read a xlsx file by path")
  .option("-d, --decrypt <value>", "Decrypt a string")
  .option("-e, --encrypt <value>", "Encrypt a string")
  .parse(process.argv);

const options = program.opts();

function main(options: any) {
  if (options["decrypt"]) {
    return decrypt(options["decrypt"]);
  }

  if (options["encrypt"]) {
    return encrypt(options["decrypt"]);
  }

  if (options["xlsx"]) {
    return readXlsxFile(options["xlsx"]);
  }
}

const result = main(options);

console.log("\\/-------------------------\\/\n");
console.log(result);
console.log("\n/\\-------------------------/\\");
