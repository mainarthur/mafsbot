const shuntingYardSort = require("./math/shuntingYardSort.js");
const Token = require("./math/Token.js");
const count = require("./math/count.js");

module.exports = async function(expressionsArray, udata) {
	
	if(expressionsArray.length < 2) {
		return {
			status: "error",
			type: "statsQuery",
			text: '<b>Ошибка:</b>\n<code>Входной массив слишком маленький. Минимальное количество элементов - 2</code>',
			result: 'Ошибка: Входной массив слишком маленький. Минимальное количество элементов - 2'
		}
	} else if(expressionsArray.length > 200) {
		return {
			status: "error",
			type: "statsQuery",
			text: '<b>Ошибка:</b>\n<code>Входной массив слишком большой. Максимальное количество элементов - 200</code>',
			result: 'Ошибка: Входной массив слишком большой. Максимальное количество элементов - 200'
		}
	}
	
	
	let tokens = expressionsArray.map(expression => Token.tokenize(expression, udata.scope));
	let results = [];
	let errors = [];
	
	let allTokens = tokens.reduce((ac, v) => ac.concat(v),[]);
	
	let variables = allTokens.filter(t => t.type === "Variable");
	
	if(variables.length > 0) {
		let v = {};
		variables.forEach(vr => v[vr] = 1);
		errors = Object.keys(v).map(t => `<i>Не найдено значение переменной "</i><code>${t.value}</code><i>"</i>`);
	}
	
	if(errors.length < 10) {
		let illegalCharacters = allTokens.filter(t => t.type === "Illegal Character");
		
		if(illegalCharacters.length > 0) {
			let symbols = {};
			illegalCharacters.forEach(ch => symbols[ch] = 1);
			errors = errors.concat(Object.keys(symbols).map(ch => `<i>Недопустимый символ '</i><code>${ch}</code><i>'</i>`));
		}
	}
	
	if(errors.length == 0) {
		let errorIndex = null;
		for(let i = 0; i < tokens.length; i++) {
			try {
				let polish = shuntingYardSort(tokens[i]);
		
				results.push(count(polish));
				
				if(errorIndex != null && errorIndex + 10 >= i)
					break;
			} catch(e) {
				if(!errorIndex)
					errorIndex = i;
				errors.push(e.message);
			}
		}
	}
	let text = `<b>Выражение:</b>\n<code>${prepareHTML(expressionsArray.join("; "))}</code>\n\n`;
	if(errors.length === 0) {
		let modaDic = {};
		let sum = 0;
		
		results = results.map(n => {
			n = parseFloat(n);
			modaDic[n] = modaDic[n] ? modaDic[n] + 1 : 1;
			sum += n;
			return n
		}).sort((a,b) => a - b);
		
		let n = results.length;
		
		text += `<b>Результат (в порядке возрастания):</b>\n<code>${prepareHTML(results.join("; "))}</code>\n\n`;
		
		
		let min = results[0];
		let max = results[results.length-1];
		
		let range = max - min;
		
		text += `${"Количество элементов: ".bold()}<code>${n}</code>\n`;
		text += `${"Минимум: ".bold()}<code>${min}</code>\n`;
		text += `${"Максимум: ".bold()}<code>${max}</code>\n`;
		text += `${"Диапазон: ".bold()}<code>${range}</code>\n`;
		if(results.length % 2 == 0) {
			text += `${"Медиана: ".bold()}<code>${(results[Math.floor(results.length/2)] + results[Math.ceil(results.length/2)])/2}</code>\n`;
		} else {
			text += `${"Медиана: ".bold()}<code>${results[Math.floor(results.length/2)]}</code>\n`;
		}
		
		let moda = Object.keys(modaDic).sort((a,b) => modaDic[b] - modaDic[a])[0];
		
		text += `${"Мода: ".bold()}<code>${moda}</code>\n`;
		
		let average = sum / results.length;
		
		text += `${"Сумма: ".bold()}<code>${sum}</code>\n`;
		text += `${"Среднее: ".bold()}<code>${average.toFixed(3)}</code>\n`;
		
		let v = results.map(e => e - average);
		text += `${"Отклонения: \n".bold()}<code>${v.map(e => e.toFixed(3)).join("; ")}</code>\n`;
		
		let disp = v.reduce((ac, v) => ac + v*v, 0)/(n-1);
		
		text += `${"Дисперсия: ".bold()}<code>${disp.toFixed(4)}</code>\n`;
		
		let sko = Math.sqrt(disp);
		
		text += `${"СКО: ".bold()}<code>${sko.toFixed(3)}</code>\n`;
		
		let dispAvr = disp/n;
		
		text += `${"Дисперсия среднего: ".bold()}<code>${dispAvr.toFixed(4)}</code>\n`;
		
		let skoAvr = Math.sqrt(dispAvr);
		
		text += `${"СКО среднего: ".bold()}<code>${skoAvr.toFixed(3)}</code>\n`;
		 
		if(n >= 80) {
			let intervals = 7
			
			let oneInterval = range/intervals;
			
			text += `${"Количество интервалов: ".bold()}<code>${intervals}</code>\n`;
			text += `${"Размер интервала: ".bold()}<code>${oneInterval.toFixed(2)}</code>\n`;
			
			let expN = {}
			let intervalAverages = [];
			let t = [];
			let y = [];
			let teorN = []
			for(var i = 0, j = 1; i < results.length; i++) {
				let el = results[i];
				
				if(el > min + oneInterval*j) {
					intervalAverages.push((min + oneInterval*j + min + oneInterval*(j+1))/2);
					t.push((intervalAverages[intervalAverages.length-1]-average)/sko);
					y.push(1/Math.sqrt(2*Math.PI)*Math.pow(Math.E, -Math.pow(t[t.length-1], 2)/2));
					teorN.push(n*oneInterval/sko*y[y.length-1]);
					j++;
				}
				
				expN[j] = expN[j] ? expN[j] + 1 : 1;
				
			}
			
			if(intervalAverages.length != intervals) {
				intervalAverages.push((min + oneInterval*j + min + oneInterval*(j+1))/2);
				t.push((intervalAverages[intervalAverages.length-1]-average)/sko);
				y.push(1/Math.sqrt(2*Math.PI)*Math.pow(Math.E, -Math.pow(t[t.length-1], 2)/2));
				teorN.push(n*oneInterval/sko*y[y.length-1]);
			}
			
			text += `${"Количество элементов по интервалам: ".bold()}<code>${Object.keys(expN).sort().map(e => `${e} - ${expN[e]}`).join(";")}</code>\n`;
			text += `${"Нормированные отклонения: ".bold()}<code>${t.map(e => e.toFixed(3)).join(";")}</code>\n`;
			text += `${"Плотность вероятностей для нормального распределения: ".bold()}<code>${y.map(e => e.toFixed(3)).join(";")}</code>\n`;
			text += `${"Теоретические частоты: ".bold()}<code>${teorN.map(e => Math.round(e)).join(";")}</code>\n`;
			
		}
	} else {
		errors = errors.slice(0, 10);
		text += "Ошибка:".bold() + errors.join("\n");
	}
	
	return {
		status: errors.length === 0 ? "ok" : "error",
		type: "statsQuery",
		text: text,
		result: (errors.length === 0 ? results.join(", ") : `Ошибка! ${errors.join(',')}`).toString().substring(0, 40)
	}
}

function prepareHTML(text) {
	return text.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}