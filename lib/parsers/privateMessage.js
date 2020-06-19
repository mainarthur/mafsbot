console.log(`${__filename} loaded`);

const parsers = { 
	command: require("./command.js")
};

const bot = require("../bots/bot.js");

const answerQuery = require("../answerQuery.js");

async function privateMessage(msg, udata) {
	let match = parsers.command(msg);
	
	console.log("[bot] new private message");
	
	if(match == null) {
		console.log(`[private] text`);
		await answerToText(msg, udata);
	} else {
		console.log(`[private] command`)
		await answerToCommand(msg, match, udata);
	}
}

async function answerToCommand(msg, match, udata) {
	let {command, args} = match;
	let { from: user, message_id: mid } = msg;
	let { id: uid } = user;
	
	console.log(`[private ans to command] uid=${uid} command="${command}" args="${args}"`);
	
	if(command == "start") {
		await bot.sendMessage(uid, `Привет, ${prepareHTML(user.first_name)}${!user.last_name ? "" : " " + prepareHTML(user.last_name)}! Я бот который поможет тебе посчитать почти любое математическое выражение.\n\nДля большей информации - /help`, {
			parse_mode: "HTML"
		});
	}
	
	if(command == "remove" || command == "rm") {
		if(Object.keys(udata.scope).length === 0) {
			await bot.sendMessage(uid, `У вас нет переменных. Чтобы создать переменную прочитайте /help`, {
				parse_mode: "HTML",
				reply_to_message_id: mid
			});
		} else if(args.trim() == "") {
			await bot.sendMessage(uid, `Синтаксис команды: /remove <i>variableName</i>, где <i>variableName</i> - имя переменной, которую вы хотите удалить`, {
				parse_mode: "HTML",
				reply_to_message_id: mid
			});
		} else {
			let m = args.match(/^([a-z]+)$/i);
			if(m == null) {
				await bot.sendMessage(uid, `Синтаксис команды: /remove <i>variableName</i>, где <i>variableName</i> - имя переменной, которую вы хотите удалить`, {
					parse_mode: "HTML",
					reply_to_message_id: mid
				});
			} else {
				let name = m[1];
				if(udata.scope[name] == null) {
					await bot.sendMessage(uid, `Переменную <i>${prepareHTML(name)}</i> не найдено. Возможно, она уже удалена`, {
						parse_mode: "HTML",
						reply_to_message_id: mid
					});
				} else {
					delete udata.scope[name];
					await bot.sendMessage(uid, `Переменная <i>${prepareHTML(name)}</i> удалена`, {
						parse_mode: "HTML",
						reply_to_message_id: mid
					});
					await db.update({ uid: uid }, udata);
				}
			}
		}
	}
	
	if(command == "list" || command == "ls") {
		let variables = Object.keys(udata.scope);
		
		if(variables.length === 0) {
			await bot.sendMessage(uid, `У вас нет переменных. Чтобы создать переменную прочитайте /help`, {
				parse_mode: "HTML",
				reply_to_message_id: mid
			});
		} else {
			let answer = variables.map(v => `<i>${prepareHTML(v)}</i> = <b>${udata.scope[v]}</b>`).join("\n");
			
			await bot.sendMessage(uid, answer, {
				parse_mode: "HTML",
				reply_to_message_id: mid
			});
		}
	}
	
	if(command == "help") {
		await bot.sendMessage(uid, "https://telegra.ph/Mafs-04-27");
	}
	
}

async function answerToText(msg, udata) {
	let { chat, text, from: user, message_id: mid} = msg;
	let { id: uid } = user;
	
	if(text == null)
		return;
		
	let query = text;
	let result = (await answerQuery(query, udata)).text;
	if(result.length < 4096) {
		await bot.sendMessage(uid, result, {
			parse_mode: "HTML",
			reply_to_message_id: mid
		});
	} else {
		let arr = result.split("\n");
		for(let i = 0; i < Math.ceil(arr.length/10); i++) {
			await bot.sendMessage(uid, arr.slice(i*10, (i+1)*10).join("\n"), {
				parse_mode: "HTML",
				reply_to_message_id: i == 0 ? mid : null
			});
		}
	}
	
	
}

function prepareHTML(text) {
	return text.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

module.exports = privateMessage;