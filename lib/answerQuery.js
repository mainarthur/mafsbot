const shuntingYardSort = require("./math/shuntingYardSort.js");
const Token = require("./math/Token.js");
const count = require("./math/count.js");

const calcQuery = require("./calcQuery");
const varQuery = require("./varQuery");
const fitQuery = require("./fitQuery");
const statsQuery = require("./statsQuery");

module.exports = async function answerQuery(query, udata) {
	let res = {};
	try {
		
		query = query.split(" ").join("");
		if(query.indexOf("=") === -1 && query.indexOf("fit\n") !== 0 && query.indexOf(";") === -1) {
			res = await calcQuery(query, udata);
		} else if(query.indexOf("=") !== -1) {
			let varName = query.substring(0, query.indexOf("=")).trim();
			
			let expression = query.substring(query.indexOf("=")+1).trim();
			
			res = await varQuery(varName, expression, udata);
		} else if(query.indexOf("fit\n") === 0 && query.indexOf(";") !== -1) {
			let expressionsMatrix = query.split("\n").slice(1).map(e => e.split(";").map(o => o.trim()));
			
			res = await fitQuery(expressionsMatrix, udata);
		} else if(query.indexOf(";") !== -1 && query.indexOf("fit\n") !== 0) {
			let expressionsArray = query.split(";").map(e => e.trim()).filter(e => e != "");
			
			res = await statsQuery(expressionsArray, udata);
		}
		
	} catch(e) {
		console.log(e);
	} 
	await db.update({uid: udata.uid }, udata);
	console.log(res)
	return res;
}

function prepareHTML(text) {
	return text.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}