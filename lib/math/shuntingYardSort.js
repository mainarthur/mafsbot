const Token = require("./Token");
const MathError = require("./MathError");

function shuntingYardSort(tokens) {
	let result = []
	
	let stack = [];
	
	for(let i = 0; i < tokens.length; i++) {
		
		let token = tokens[i];
		
		console.log(`Shunting.Yard.Sort ${token.type}(${token.value}) ${token.priority}`);
		
		if(token.type === "Literal") {
			result.push(token);
		} else if(token.type === "Function"){
			stack.push(token);
		} else if(token.type === "Function Argument Separator") {
			
			while(stack.length && stack[stack.length-1].type !== "Left Parenthesis") {
				let t = stack.pop();
				
				result.push(t);
			}
			
			if(stack.length == 0) {
				throw new MathError("Беды с функцией")
			}
			
		} else if(token.type === "Operator") {
			while(stack.length && stack[stack.length-1].type === "Operator" && stack[stack.length-1].priority > token.priority) {
				let t = stack.pop();
				
				result.push(t);
			}
			
			stack.push(token);
		} else if(token.type === "Left Parenthesis") {
			stack.push(token);
		} else if(token.type === "Right Parenthesis") {
			let parentheisError = true;
			while(stack.length) {
				let t = stack.pop();
				
				if(t.type === "Left Parenthesis") {
					parentheisError = false;
					break;
				}
				
				result.push(t);
			}
			
			if(parentheisError) {
				throw new MathError("Беды с закрывающими скобками");
			}
			
			if(stack.length && stack[stack.length-1].type === "Function") {
				result.push(stack.pop());
			}
		} 
	}
	
	while(stack.length) {
		let t = stack.pop();
		
		if(t.type === "Left Parenthesis") {
			throw new MathError("Беды с открывающими скобочками");
		}
		
		result.push(t)
	}
	return result;
}

module.exports = shuntingYardSort;