
const {cmd , commands} = require('../command')
const yts = require('yt-search');
const fg = require('api-dylux');


cmd({
  pattern: "song",
  react: "🎵",
  alias: ["ytmp3", "mp3"],
  desc: "Download Your Songs.",
  category: "download",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("*❌ Provide a title or URL*");

    const searchResults = await ytsearch(q);
    if (searchResults.results.length < 1) return reply("*❌ No results found!*");

    const firstResult = searchResults.results[0];
    const downloadInfo = await ytmp3(firstResult.url);

    const messageCaption = `
🎶 *ᴅɪᴢᴇʀ ꜱᴏɴɢ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ* 📥

🎵 *TITLE :* ${firstResult.title}
🤵 *AUTHOR :* ${firstResult.author.name}
⏱ *DURATION :* ${firstResult.timestamp}
👀 *VIEWS :* ${firstResult.views}
🖇️ *URL :* ${firstResult.url}

*📥 CHOOSE A DOWNLOAD FORMAT;*

1️⃣ AUDIO FILE 
2️⃣ DOCUMENT FILE

> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅɪᴢᴇʀ*
`;

    // Forwarding Metadata
    const contextInfo = {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterName: "DIZER-MD",
        newsletterJid: "120363305237506243@newsletter",
      },
      externalAdReply: {
        title: "DIZER-MD Bot Menu",
        body: "© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅɪᴢᴇʀ",
        thumbnailUrl: "https://i.ibb.co/ZRCcNkpQ/6193.jpg",
        mediaType: 1,
        renderLargerThumbnail: true,
      },
    };

    const sentMessage = await conn.sendMessage(from, {
      image: { url: firstResult.thumbnail || firstResult.image || '' },
      caption: messageCaption,
      contextInfo: contextInfo
    }, { quoted: mek });

    conn.ev.on('messages.upsert', async update => {
      const newMessage = update.messages[0];
      if (!newMessage.message || !newMessage.message.extendedTextMessage) return;

      if (newMessage.message.extendedTextMessage.contextInfo &&
          newMessage.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id) {

        const userChoice = newMessage.message.extendedTextMessage.text.trim();
        try {
          switch (userChoice) {
            case '1':
              await conn.sendMessage(from, {
                audio: { url: downloadInfo.download.url },
                mimetype: 'audio/mpeg'
              }, { quoted: mek });
              break;

            case '2':
              await conn.sendMessage(from, {
                document: { url: downloadInfo.download.url },
                mimetype: 'audio/mpeg',
                fileName: `${downloadInfo.result.title}.mp3`,
                caption: "> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅɪᴢᴇʀ*"
              }, { quoted: mek });
              break;

            default:
              reply("Invalid option. Please select a valid option 🔴");
          }
        } catch (err) {
          console.error(err);
          reply(`${err}`);
        }
      }
    });
  } catch (err) {
    console.error(err);
    reply(`${err}`);
  }
});
