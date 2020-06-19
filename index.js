console.log(`${__filename} loaded`);

const bot = require("./lib/bots/bot.js");;
const log = require("./lib/log.js");
const Datastore = require("nedb-promise");
const md5 = require("md5");

global.db = new Datastore({ autoload: true, filename: "./data/data.db" });

const messageParser = require("./lib/parsers/privateMessage.js");

const answerQuery = require("./lib/answerQuery");

(async function() {	
	await bot.startPolling();
	console.log(`[bot] polling started`);
	log(`Bot started at ${new Date().toString()}`);
	
})();

var antiflood = {};

bot.on('message', async (msg) => {
	let { from: user } = msg;
	let uid = user.id;
	
	
	if(antiflood[uid] == null) {
		antiflood[uid] = {};
	}
	
	let now = Math.floor(Date.now() / 1000);
	if(antiflood[uid][now] == null) {
		antiflood[uid][now] = 1;
	} else { 
		antiflood[uid][now]++;
	}
	
	if(antiflood[uid][now] > 3)
		return;
	
	console.log("[bot] new message");
	
	let udata = await db.findOne({ uid: uid });
	if(udata == null) {
		udata = {
			uid: uid,
			userinfo: user,
			scope: {},
			errors: {},
			results: {}
		}
		await db.insert(udata);
		log(prepareHTML(user.first_name + (user.last_name? " " + user.last_name: "")) + "[#id" + udata.uid + "][" + (await db.count({})) + "] added to db at " + new Date().toString())
	}
	
	await messageParser(msg, udata);
});

bot.on('inline_query', async (iq) => {
	let qid = iq.id;
	let query = iq.query;
	let uid = iq.from.id;
	let user = iq.from;
	
	let udata = await db.findOne({ uid: uid });
	if(udata == null) {
		udata = {
			uid: uid,
			userinfo: user,
			scope: {},
			errors: {},
			results: {}
		}
		await db.insert(udata);
		log(prepareHTML(user.first_name + (user.last_name? " " + user.last_name: "")) + "[#id" + udata.uid + "][" + (await db.count({})) + "] added to db at " + new Date().toString())
	}
	
	let res = []
	
	if(query != "" && query != "meme") {
		let answer = await answerQuery(query, udata);
		res = [{
			type: "article",
			id: md5(query + uid),
			title: answer.result,
			input_message_content: {
				message_text: answer.text.length < 4096 ? answer.text :  "Ответ слишком большой, перейдите в ЛС с ботом",
				parse_mode: "html",
				disable_web_page_preview: true,
				reply_makrup: answer.text.length < 4096 ? {} : {
					inline_keyboard: [[{
						text: "Перейти",
						url: "https://t.me/dclcbot"
					}]]
				}
			}
		}];
		
	} else if(query == "meme") {
		res = [{
			type: "photo",
			title: "meme",
			id: "meme",
			descriltion: "meme",
			photo_url: "https://telegra.ph/file/aba986c8211cd80d8d1f1.jpg",
			thumb_url: "https://telegra.ph/file/aba986c8211cd80d8d1f1.jpg"
		}];
	}
	
	await bot.answerInlineQuery(qid, res);;
	
	
});

function prepareHTML(text) {
	return text.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

String.prototype.replaceAll = function(s, t) {
	return this.split(s).join(t);
}
