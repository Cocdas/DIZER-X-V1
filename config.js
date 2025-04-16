const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || 'jIo3zQKL#JLlG_2YwxoPRtKY0YzA77YZLebfy_K1qhQJvRwZN1yY',
MONGODB: process.env.MONGODB || "mongodb://mongo:PfSKxxgTGBIDHjhYOTXYqDtHVjOXHSZH@interchange.proxy.rlwy.net:31459",
};
