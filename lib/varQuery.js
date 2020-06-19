const shuntingYardSort = require("./math/shuntingYardSort.js");
const Token = require("./math/Token.js");
const count = require("./math/count.js");

const calcQuery = require("./calcQuery");

module.exports = async function(varName, expression, udata) {
	let result, varNameError;
	
	if(!(/^[a-zA-Z]{1,35}$/).test(varName)) {
		varNameError = "<i>Недопустимое название для переменной</i>";
	}
	
	let res = await calcQuery(expression, udata);
	res.type = "varQuery";
	
	if(res.status == "ok") {
		if(!varNameError) {
			udata.scope[varName] = res.result;
			res.text += `\n\n<b>Результат был сохранен в переменную —</b> <code>${varName}</code>`
		} else {
			res.text += `\n\n<b>Ошибка! неправильное имя для переменной —</b> "<code>${varName}</code>"`
		}
	}
	
	
	return res;
}

function prepareHTML(text) {
	return text.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}