const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const axios = require('axios');
const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

const { getBuffer, getGroupAdmins } = require('./lib/functions');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const { File } = require('megajs');
const { sms } = require('./lib/msg');

const ownerNumber = ['94787351423'];

// Download session if not present
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
  if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');
  const sessdata = config.SESSION_ID;
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
  filer.download((err, data) => {
    if (err) throw err;
    fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, () => {
      console.log("Session downloaded ✅");
    });
  });
}

async function connectToWA() {
  const connectDB = require('./lib/mongodb');
  connectDB();

  const { readEnv } = require('./lib/database');
  const config = await readEnv();
  const prefix = config.PREFIX;

  const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/');
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version
  });

  conn.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        connectToWA();
      }
    } else if (connection === 'open') {
      console.log("✅ Bot Connected!");

      const path = require('path');
      fs.readdirSync("./plugins/").forEach((plugin) => {
        if (path.extname(plugin) === ".js") {
          require("./plugins/" + plugin);
        }
      });

      const up = `✅ DIZER X Bot Connected!\n\n👤 ID: ${conn.user.id}\n📡 Status: ONLINE`;

      conn.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {
        image: { url: "https://i.ibb.co/tpJGQkr/20241122-203120.jpg" },
        caption: up
      });
    }
  });

  conn.ev.on('creds.update', saveCreds);

  // Send file from URL
  conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
    const res = await axios.head(url);
    const mime = res.headers['content-type'];
    const buffer = await getBuffer(url);

    if (mime.includes("image")) {
      return conn.sendMessage(jid, { image: buffer, caption, ...options }, { quoted });
    } else if (mime.includes("video")) {
      return conn.sendMessage(jid, { video: buffer, caption, mimetype: 'video/mp4', ...options }, { quoted });
    } else if (mime.includes("audio")) {
      return conn.sendMessage(jid, { audio: buffer, mimetype: 'audio/mpeg', ...options }, { quoted });
    } else if (mime.includes("pdf")) {
      return conn.sendMessage(jid, { document: buffer, mimetype: 'application/pdf', caption, ...options }, { quoted });
    }
  };

  // Send button message
  const sendButton = async (jid, text, footer, buttons, quoted) => {
    const buttonMessage = {
      text,
      footer,
      buttons,
      headerType: 1
    };
    return await conn.sendMessage(jid, buttonMessage, { quoted });
  };

  conn.ev.on('messages.upsert', async ({ messages }) => {
    const mek = messages[0];
    if (!mek.message) return;

    mek.message = getContentType(mek.message) === 'ephemeralMessage'
      ? mek.message.ephemeralMessage.message
      : mek.message;

    const m = sms(conn, mek);
    const type = getContentType(mek.message);
    const from = mek.key.remoteJid;
    const body = m.body;
    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(" ");

    const isGroup = from.endsWith('@g.us');
    const sender = mek.key.fromMe ? conn.user.id : (mek.key.participant || mek.key.remoteJid);
    const senderNumber = sender.split('@')[0];
    const botNumber = conn.user.id.split(':')[0];
    const pushname = mek.pushName || "Unknown";

    const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage || [];
    const reply = (text) => conn.sendMessage(from, { text }, { quoted: mek });

    // Button click handler
    if (mek.message?.buttonsResponseMessage) {
      const buttonId = mek.message.buttonsResponseMessage.selectedButtonId;
      if (buttonId === `${prefix}alive`) return reply("✅ Bot is alive and working!");
      if (buttonId === `${prefix}owner`) return reply("👑 Owner: wa.me/94787351423");
    }

    // Auto react for owner
    if (senderNumber === "94787351423") m.react("👨‍💻");

    // Command handler
    if (command === "menu") {
      const buttons = [
        { buttonId: `${prefix}alive`, buttonText: { displayText: "✅ Alive" }, type: 1 },
        { buttonId: `${prefix}owner`, buttonText: { displayText: "👑 Owner" }, type: 1 }
      ];
      return sendButton(from, "🧬 Welcome to *DIZER X*!", "Select an option below:", buttons, mek);
    }
  });
}

app.get("/", (req, res) => {
  res.send("✅ Bot Started.");
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

setTimeout(() => {
  connectToWA();
}, 4000);
