const shuntingYardSort = require("./math/shuntingYardSort.js");
const Token = require("./math/Token.js");
const count = require("./math/count.js");

module.exports = async function(expression, udata) {
	let tokens = Token.tokenize(expression, udata.scope);
	let result, error;
		
	let variables = tokens.filter(t => t.type === "Variable");
		
	if(variables.length > 0) {
		let v = {};
		variables.forEach(vr => v[vr] = 1);
		error = Object.keys(v).map(t => `<i>Не найдено значение переменной "</i><code>${t.value}</code><i>"</i>`).slice(0,10).join("\n");
	}
	
	if(!error) {
		let illegalCharacters = tokens.filter(t => t.type === "Illegal Character");
		
		if(illegalCharacters.length > 0) {
			let symbols = {};
			illegalCharacters.forEach(ch => symbols[ch] = 1);
			error = Object.keys(symbols).map(ch => `<i>Недопустимый символ '</i><code>${ch}</code><i>'</i>`).slice(0,10).join("\n");
		}
	}
		
	if(error == null) {
		try {
			let polish = shuntingYardSort(tokens);
		
			result = count(polish);
		} catch(e) {
			console.log(e)
			error = `<code>${e.message}</code>`
		}
	}
	
	return {
		status: result != null ? "ok" : "error",
		type: "calcQuery",
		text: `<b>Выражение:</b>\n<code>${prepareHTML(expression)}</code>\n\n<b>${result != null ? "Результат" : "Ошибка"}:</b>\n${result != null ? `<code>${result}</code>`: error}`,
		result: (result != null ? result : `Ошибка!`).toString()
	}
}

function prepareHTML(text) {
	return text.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}