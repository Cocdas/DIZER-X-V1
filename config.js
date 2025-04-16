const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || 'DMhyFAbQ#aefngxoDkmlgIB83evTE7U4Bzq3vtG6cpHTl4eEF9hg',
MONGODB: process.env.MONGODB || "mongodb://mongo:PfSKxxgTGBIDHjhYOTXYqDtHVjOXHSZH@interchange.proxy.rlwy.net:31459",
};
