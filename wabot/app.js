import { bot } from "./bot.js";
import { lookup } from "mime-types";
import { basename } from "path";
import fastify from "fastify";
import FastifyHttpProxy from '@fastify/http-proxy';

//#region REST

const port = 5006;
const host = "127.0.0.1";
const server = fastify({ logger: true });

/**
 * Mengirim pesan text
 * POST: /send/text
 * Parameter:
 * @param {string} number Nomer penerima pesan
 * @param {string} message Pesan yang akan dikirim
 */
server.post("/send/text", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "POST");

  try {
    const number = request.body.number;
    const message = request.body.message;

    const [recipient] = await bot.onWhatsApp(formatRecipient(number));
    if (!recipient.exists)
      throw Error(`Nomer ${number} tidak terdaftar pada WhatsApp.`);

    const result = await bot.sendMessage(recipient.jid, {
      text: message,
    });

    return {
      id: result?.key?.id,
      to: result?.key?.remoteJid,
      message,
    };
  } catch (error) {
    reply.send(error);
  }
});

/**
 * Mengirim lokasi
 * POST: /send/location
 * Parameter:
 * @param {string} number Nomer penerima pesan
 * @param {string} message Pesan yang akan dikirim
 */
server.post("/send/location", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "POST");

  reply.send({
    error: "Sending location is not supported at the momment",
  });

  // try {
  //   const number = request.body.number;
  //   const latitude = request.body.latitude;
  //   const longitude = request.body.longitude;
  //   const title = request.body.title;
  //   // const device = request.body.device;

  //   const location = new Location(latitude, longitude, title);
  //   const result = await sirs.sendMessage(formatRecipient(number), location);
  //   reply.send({
  //     text: result.body,
  //     timestamp: result.timestamp,
  //     to: result.to,
  //     type: result.type,
  //   });
  // } catch (error) {
  //   reply.send(error);
  // }
});

/**
 * Mengirim pesan file
 * form-data: /send/file
 * Parameter:
 * @param {string} number Nomer penerima pesan
 * @param {string} message Caption file yang akan dikirim
 * @param {Blob} file File yang akan dikirim
 */
server.post("/send/file", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "POST");

  const contentType = request.headers["content-type"];

  try {
    const number = request.body.number;
    const message = request.body.message;
    const file = request.body.file;
    const name = request.body.name || basename(request.body.file);
    const mime = request.body.mime || lookup(name) || "text/plain";

    const recipient = await formatRecipient(number);
    if (!recipient) {
      const num = number.split("@").shift();
      throw Error(`Nomer ${num} tidak terdaftar WhatsApp.`);
    }

    if (mime.includes("image")) {
      const result = await bot.sendMessage(recipient, {
        image: { url: file },
        mimetype: mime,
        caption: message,
        fileName: name,
      });

      return {
        id: result?.key?.id,
        to: result?.key?.remoteJid,
        message,
      };
    } else {
      const result = await bot.sendMessage(recipient, {
        document: { url: file },
        mimetype: mime,
        caption: message,
        fileName: name,
      });

      return {
        id: result?.key?.id,
        to: result?.key?.remoteJid,
        message,
      };
    }
  } catch (error) {
    reply.send(error);
  }
});

// Start rest server
try {
  const address = await server.listen({ port, host });
  console.log(`http service started at ${address}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}

/**
 * Format recipient
 * @param {string} number
 * @returns
 */
function formatRecipient(number) {
  number = number.replace("c.us", "s.whatsapp.net");
  if (!number.includes("s.whatsapp.net") && !number.includes("g.us")) {
    const group = number.includes("-") || number.length > 15;
    const domain = group ? "g.us" : "s.whatsapp.net";
    return `${number}@${domain}`;
  } else {
    return number;
  }
}

