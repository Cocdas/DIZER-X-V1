const { readEnv } = require('../lib/database');
const { cmd } = require('../command');

// ========== MENU COMMAND ==========
cmd({
    pattern: "bots",
    react: "📜",
    desc: "Display bot menu as PDF document",
    category: "main",
    filename: __filename,
},
async (conn, mek, m, { from, reply, pushname }) => {
    try {
        // Replace with your actual PDF URL
        const pdfUrl = 'https://example.com/dizer-md-menu.pdf'; 
        // Replace with your actual thumbnail URL
        const thumbnailUrl = 'https://telegra.ph/file/3c64b5608dd82d33dabe8.jpg';
        
        // Your menu message text
        const MENU_MSG = `
👋 Hello *${pushname || "User"}*! 

Here is the *DIZER-MD* menu document with all available commands.

▢ *Bot Name:* DIZER-MD
▢ *Developer:* Your Name
▢ *Version:* 1.0.0
▢ *Uptime:* ${process.uptime()}

📌 Download and view the PDF for complete command list
        `;

        return await conn.sendMessage(from, {
            document: { url: pdfUrl }, // Path to your PDF file
            fileName: '𝐃𝐈𝐙𝐄𝐑 - 𝐌𝐃 𝐌𝐄𝐍𝐔', // Filename for the document
            mimetype: "application/pdf",
            fileLength: 99999999999999,
            pageCount: 2024,
            caption: MENU_MSG,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterName: '𝐃𝐈𝐙𝐄𝐑 - 𝐌𝐃',
                    newsletterJid: "120363305237506243@newsletter",
                },
                externalAdReply: {
                    title: '𝐃𝐈𝐙𝐄𝐑 - 𝐌𝐃 𝐁𝐎𝐓',
                    body: '> ⏤͟͟͞͞★❬❬ DIZER-MD WhatsApp Bot ❭❭⏤͟͟͞͞★​',
                    thumbnailUrl: thumbnailUrl,
                    sourceUrl: 'https://senu-web-cocdas-projects.vercel.app/',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`❌ Error sending menu: ${e}`);
    }
});
