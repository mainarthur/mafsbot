const shuntingYardSort = require("./math/shuntingYardSort.js");
const Token = require("./math/Token.js");
const count = require("./math/count.js");

module.exports = async function(expressionsMatrix, udata) {
	console.log(expressionsMatrix);
	if(expressionsMatrix.length < 3) {
		return {
			status: "error",
			type: "fitQuery",
			text: '<b>Ошибка:</b>\n<code>Входной массив точек слишком маленький. Минимальное количество точек - 3</code>',
			result: 'Ошибка: Входной массив точек слишком маленький. Минимальное количество точек - 3'
		}
	} else if(expressionsMatrix.length > 200) {
		return {
			status: "error",
			type: "fitQuery",
			text: '<b>Ошибка:</b>\n<code>Входной массив точек слишком большой. Максимальное количество точее - 200</code>',
			result: 'Ошибка: Входной массив точек слишком большой. Максимальное количество точек - 200'
		}
	}
	
	let tokens = expressionsMatrix.map(dots => dots.map(expression => Token.tokenize(expression, udata.scope)));
	let results_x = [];
	let results_y = [];
	let results = [];
	let errors = [];
	
	let allTokens = tokens.reduce((ac1, dot) => {
		return ac1.concat(dot.reduce((ac2, v) => {
			return ac2.concat(v);
		}, []));
	},[]);
	
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
				let polish_x = shuntingYardSort(tokens[i][0]);
				let polish_y = shuntingYardSort(tokens[i][1]);
		
				results_x.push(count(polish_x));
				results_y.push(count(polish_y));
				
				if(errorIndex != null && errorIndex + 10 >= i)
					break;
			} catch(e) {
				if(!errorIndex)
					errorIndex = i;
				errors.push(e.message);
			}
		}
	}
	
	if(errors.length === 0 && results_x.length != results_y.length) {
		errors.push("<code>Количество x-ов не совпадает с количеством у-ков</code>")
	}
	
	let text = `<b>Выражение:</b>\n<code>fit\n${prepareHTML(expressionsMatrix.map(e => e.join("; ")).join("\n"))}</code>\n\n`;
	if(errors.length === 0) {
		let n = results_x.length;
		let x = [];
		let y = results_x;
		let l = results_y;
		
		let recom = [];
		
		for(let i = 0; i < n; i++)
			x.push(1);
		
		let xx = gaussSum(x,x);
		let xy = gaussSum(x,y);
		let yy = gaussSum(y,y);
		let xl = gaussSum(x,l);
		let yl = gaussSum(y,l);
		
		let q = (xx*yy-Math.pow(xy,2))
		
		let a = (xx*yl-xy*xl)/q;
		let b = (yy*xl-xy*yl)/q;
		
		let teorL = results_x.map(x => a*x+b);
		let v = teorL.map((tl, i) => tl - l[i]);
		
		let Sv = Math.sqrt(v.reduce((ac, el) => ac + el*el, 0)/(n-2));
		recom.push({sv: Sv, type: "Прямая"});
		
		let Sa = Math.sqrt(xx/q) * Sv;
		let Sb = Math.sqrt(yy/q) * Sv;
		
		text += `${"Прямая (y=a*x+b): \n".bold()}<code>y=${a}*x${b > 0 ? "+" + b : b}</code>\n`;
		text += `${"Неопределенности: \n".bold()}<code>S(v)=${Sv}</code>\n<code>S(a)=${Sa}</code>\n<code>S(b)=${Sb}</code>\n\n`;
		
		results.push(`y=${a}*x${b > 0 ? "+" + b : b}`);
		
		let yPositive = true;
		let xPositive = true;
		
		for(let i = 0; i < n; i++) {
			if(yPositive && results_y[i] <= 0)
				yPositive = false;
				
			if(xPositive && results_x[i] <= 0)
				xPositive = false;
				
			if(!yPositive && !xPositive)
				break;
		}
		
		let ln_y, ln_l;
		
		if(xPositive) {
			ln_y = results_x.map(e => Math.log(e))
		}
		
		if(yPositive) {
			ln_l = results_y.map(e => Math.log(e))
		}
		
		if(xPositive) {
			xx = gaussSum(x,x);
			xy = gaussSum(x,ln_y);
			yy = gaussSum(ln_y,ln_y);
			xl = gaussSum(x,l);
			yl = gaussSum(ln_y,l);
		
			q = (xx*yy-Math.pow(xy,2))
		
			a = (xx*yl-xy*xl)/q;
			b = (yy*xl-xy*yl)/q;
		
			teorL = ln_y.map(x => a*x+b);
			v = teorL.map((tl, i) => tl - l[i]);
		
			Sv = Math.sqrt(v.reduce((ac, el) => ac + el*el, 0)/(n-2));
			recom.push({sv: Sv,type: "Логарифмическая"});
			
			Sa = Math.sqrt(xx/q) * Sv;
			Sb = Math.sqrt(yy/q) * Sv;
			
			text += `${"Логарифмическая (y=b+a*ln(x))): \n".bold()}<code>y=${b}${a > 0 ? "+" + a : a}*ln(x)</code>\n`;
			text += `${"Неопределенности: \n".bold()}<code>S(v)=${Sv}</code>\n<code>S(a)=${Sa}</code>\n<code>S(b)=${Sb}</code>\n\n`;
		
			results.push(`y=${b}${a > 0 ? "+" + a : a}ln(x)`)
		}
		
		if(yPositive) {
			xx = gaussSum(x,x);
			xy = gaussSum(x,y);
			yy = gaussSum(y,y);
			xl = gaussSum(x,ln_l);
			yl = gaussSum(y,ln_l);
		
			q = (xx*yy-Math.pow(xy,2))
		
			a = (xx*yl-xy*xl)/q;
			b = (yy*xl-xy*yl)/q;
		
			teorL = y.map(x => a*x+b);
			v = teorL.map((tl, i) => tl - ln_l[i]);
		
			Sv = Math.sqrt(v.reduce((ac, el) => ac + el*el, 0)/(n-2));
			recom.push({sv: Sv, type: "Экспонента"});
			
			Sa = Math.sqrt(xx/q) * Sv;
			Sb = Math.sqrt(yy/q) * Sv;
			
			b = Math.exp(b);
			
			text += `${"Экспонента (y=b*e^(a*x)): \n".bold()}<code>y=${b}*e^(${a}*x)</code>\n`;
			text += `${"Неопределенности: \n".bold()}<code>S(v)=${Sv}</code>\n<code>S(a)=${Sa}</code>\n<code>S(b)=${Sb}</code>\n\n`;
		
			results.push(`y=${b}*x^${a}`)
		}
		
		if(xPositive && yPositive) {
			xx = gaussSum(x,x);
			xy = gaussSum(x,ln_y);
			yy = gaussSum(ln_y,ln_y);
			xl = gaussSum(x,ln_l);
			yl = gaussSum(ln_y,ln_l);
		
			q = (xx*yy-Math.pow(xy,2))
		
			a = (xx*yl-xy*xl)/q;
			b = (yy*xl-xy*yl)/q;
		
			teorL = ln_y.map(x => a*x+b);
			v = teorL.map((tl, i) => tl - ln_l[i]);
		
			Sv = Math.sqrt(v.reduce((ac, el) => ac + el*el, 0)/(n-2));
			recom.push({sv: Sv, type:"Степенная"});
			
			Sa = Math.sqrt(xx/q) * Sv;
			Sb = Math.sqrt(yy/q) * Sv;
			
			b = Math.exp(b)
			
			text += `${"Степенная (y=b*x^a): \n".bold()}<code>y=${b}*x^${a}</code>\n`;
			text += `${"Неопределенности: \n".bold()}<code>S(v)=${Sv}</code>\n<code>S(a)=${Sa}</code>\n<code>S(b)=${Sb}</code>\n\n`;
		
			results.push(`y=${b}*x^${a}`)
			
			
		}
		
		if(recom.length > 1) {
			recom = recom.sort((a,b) => a.sv - b.sv)
			text += `${"Предпологаемый тип зависимости: ".bold()}<code>${recom[0].type}</code>`;
		}
		
	} else {
		errors = errors.slice(0, 10);
		text += "Ошибка:".bold() + errors.join("\n");
	}
	
	return {
		status: errors.length === 0 ? "ok" : "error",
		type: "fitQuery",
		text: text,
		result: (errors.length === 0 ? results.join(", ") : `Ошибка! ${errors.join(',')}`).toString().substring(0, 40)
	}
}

function gaussSum(arr1, arr2) {
	let sum = 0;
	for(let i = 0; i < arr1.length; i++) 
		sum += arr1[i]*arr2[i];
	return sum;
}

function prepareHTML(text) {
	return text.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}