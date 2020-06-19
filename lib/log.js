console.log(`${__filename} loaded`);

const logBot = require('./bots/logbot.js');
const Bull = require("bull")

const logQueue = new Bull("logs-domathbot", "redis://redis:6379", {
	limiter: {
		max: 20,
		duration: 1000
	}
});

const logChatId = process.env.LOG_CHAT_ID;

if(logChatId == null) {
	throw new Error(".env.LOG_CHAT_ID is not specified")
}

function log(data) {
	useDeault = true;
	if (typeof data == "object")
		return logQueue.add({ text: `[${Date().match(/\d+:\d+:\d+/)[0]}] ${JSON.stringify(data).substr(0, 4000)}` }, { removeOnComplete: true, removeOnFail: true });
	if (data == null)
		return logQueue.add({ text: `[${Date().match(/\d+:\d+:\d+/)[0]}] null`}, { removeOnComplete: true, removeOnFail: true });
	logQueue.add({ text: `[${Date().match(/\d+:\d+:\d+/)[0]}] ${data.toString().substr(0, 4000)}` }, { removeOnComplete: true, removeOnFail: true });
}

logQueue.process(async (job) => {
	if(job.data == null)
		return
	if(job.data.text == null)
		return;
		
	await logBot.sendMessage(logChatId, job.data.text, {
		parse_mode: "html",
		disable_web_page_preview: true
	});
})

module.exports = log;
