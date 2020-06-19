console.log(`${__filename} loaded`);

module.exports = new (require("node-telegram-bot-api"))(process.env.LOG_BOT_TOKEN);