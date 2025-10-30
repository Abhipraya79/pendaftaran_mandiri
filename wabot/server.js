import { lookup } from "mime-types";
import { basename } from "path";
import fastify from "fastify";

// Import fungsi untuk start bot, bukan langsung bot instance
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import EventEmitter from "events";

// Variable global untuk bot
let bot = null;

// Fungsi untuk start bot
const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("data");
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`WA v${version.join(".")}, terbaru: ${isLatest}`);

  const sock = makeWASocket({
    auth: state,
    version,
    browser: ["Ubuntu", "Chrome", "22.04.4"],
  });

  EventEmitter.defaultMaxListeners = 20;

  sock.ev.process(async (events) => {
    if (events["connection.update"]) {
      const { connection, lastDisconnect, qr } = events["connection.update"];
      
      if (qr) {
        console.log("\n📱 Scan QR code di bawah ini dengan WhatsApp:\n");
        qrcode.generate(qr, { small: true });
      }
      
      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        if (statusCode !== DisconnectReason.loggedOut) {
          bot = await startSock();
        } else {
          console.log("Connection closed. You are logged out.");
        }
      } else if (connection === "open") {
        console.log("✅ Bot tersambung ke WhatsApp!");
        await sock.sendPresenceUpdate("unavailable");
      }
    }

    if (events["creds.update"]) {
      await saveCreds();
    }
  });
  
  return sock;
};

// Start bot terlebih dahulu
bot = await startSock();

// Tunggu sampai bot benar-benar connected
await new Promise((resolve) => {
  const checkConnection = setInterval(() => {
    if (bot && bot.user) {
      clearInterval(checkConnection);
      resolve();
    }
  }, 1000);
});

//#region REST API

const port = 5006;
const host = "127.0.0.1";
const server = fastify({ logger: true });

/**
 * Health check endpoint
 */
server.get("/", async (request, reply) => {
  return {
    status: "ok",
    bot_connected: bot && bot.user ? true : false,
    bot_number: bot?.user?.id || null
  };
});

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
    if (!bot || !bot.user) {
      throw new Error("Bot belum tersambung ke WhatsApp");
    }

    const number = request.body.number;
    const message = request.body.message;

    if (!number || !message) {
      throw new Error("Parameter number dan message wajib diisi");
    }

    const formattedNumber = formatRecipient(number);
    
    // Cek apakah nomor terdaftar di WhatsApp
    const [recipient] = await bot.onWhatsApp(formattedNumber);
    if (!recipient || !recipient.exists) {
      throw new Error(`Nomor ${number} tidak terdaftar di WhatsApp`);
    }

    const result = await bot.sendMessage(recipient.jid, {
      text: message,
    });

    return {
      success: true,
      id: result?.key?.id,
      to: result?.key?.remoteJid,
      message,
    };
  } catch (error) {
    reply.code(400);
    return {
      success: false,
      error: error.message,
    };
  }
});

/**
 * Mengirim pesan file
 * form-data: /send/file
 * Parameter:
 * @param {string} number Nomer penerima pesan
 * @param {string} message Caption file yang akan dikirim
 * @param {string} file URL file yang akan dikirim
 */
server.post("/send/file", async (request, reply) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "POST");

  try {
    if (!bot || !bot.user) {
      throw new Error("Bot belum tersambung ke WhatsApp");
    }

    const number = request.body.number;
    const message = request.body.message;
    const file = request.body.file;
    const name = request.body.name || basename(request.body.file);
    const mime = request.body.mime || lookup(name) || "text/plain";

    const recipient = formatRecipient(number);

    if (mime.includes("image")) {
      const result = await bot.sendMessage(recipient, {
        image: { url: file },
        mimetype: mime,
        caption: message,
        fileName: name,
      });

      return {
        success: true,
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
        success: true,
        id: result?.key?.id,
        to: result?.key?.remoteJid,
        message,
      };
    }
  } catch (error) {
    reply.code(400);
    return {
      success: false,
      error: error.message,
    };
  }
});

// Start REST server
try {
  await server.listen({ port, host });
  console.log(`\n🚀 REST API started at http://${host}:${port}`);
  console.log(`📱 Bot WhatsApp Number: ${bot?.user?.id || 'Not connected'}\n`);
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
  // Hilangkan karakter non-numeric kecuali @, -, dan .
  number = number.replace(/[^\d@\-\.]/g, '');
  
  // Jika sudah ada format lengkap, return as is
  if (number.includes("@s.whatsapp.net") || number.includes("@g.us")) {
    return number;
  }
  
  // Deteksi group atau personal
  const isGroup = number.includes("-") || number.length > 15;
  const domain = isGroup ? "g.us" : "s.whatsapp.net";
  
  return `${number}@${domain}`;
}