const Token = require("./Token");
const MathError = require("./MathError");

function count(polish) {
	
	let stack = [];
	
	
	for(let i = 0; i < polish.length; i++) {
		let token = polish[i];
		
		console.log(`Calc.Polish ${token.type}(${token.value}) ${token.priority}`)
		
		if(token.type === "Operator") {
			let b = stack.pop();
			let a = stack.pop();
			
			if(a == null || b == null) {
				throw new MathError("Недостаточно операндов");
			}
			a = parseFloat(a.value);
			b = parseFloat(b.value);
			
			if(token.value === "+") {
				stack.push(new Token("Literal", a + b));
			} else if(token.value === "-") {
				stack.push(new Token("Literal", a - b));
			} else if(token.value === "*") {
				if((a === 0 && b === Infinity) || (a === Infinity && b === 0)) {
					throw new MathError("Ноль на бесконечность умножать нельзя ибо результат не очевиден, потому что любое число помноженное на 0 равно 0, а любое число помноженное на бесконечность равно бесконечности");
				}
				stack.push(new Token("Literal", a * b));
			} else if(token.value === "/") {
				if(a === b && b === 0) {
					throw new MathError("0 на 0 делить нельзя. a/b=c => a=cb и при a=0 b=0 результат деления может быть любым, а это - неопредлеенность");
				} else if(b === 0) {
					throw new MathError("На 0 делить нельзя. a/b=c => a=cb и при b=0 такого равенства не будет, а если a=0, то результат деления может быть любым, а это - неопределенность");
				}
				stack.push(new Token("Literal", a / b));
			} else if(token.value === "^") {
				if(a === b && b === 0) {
					throw new MathError("0^0 - неопределенность. 0^a, где а > 0, всегда равно 0, а b^0, где b ≠ 0, всегда равно 1");
				} else if(b !== parseInt(b) && a < 0) {
					throw new MathError("Отрицательные числа нельзя возводить в действительную степень. 1/3=2/6, (-2)^(1/3) ≠ (-2)^(2/6), тк вторую запись можно проинтерпретировать как корень шестой степени из -2 в квадрате, а это не равно корню кубическому из -2");
				} else if(a === 0 && b < 0) {
					throw new MathError("0 нельзя возводить в отрицательную степень");
				}
				stack.push(new Token("Literal", Math.pow(a,b)));
			} else if(token.value === "%") {
				if(b === 0) {
					throw new MathError("");
				}
				stack.push(new Token("Literal", a % b));
			}
		} else if(token.type == "Function") {
			let func = Token.Functions[token.value];
			
			if(func == null) {
				throw new MathError(`Функцию ${token.value} не найдено`);
			}
			
			let args = [];
			for(let i = 0; i < func.arguments; i++) {
				let t = stack.pop();
				if(t == null) {
					throw new MathError(`Недостаточно аргументов для функции ${token.value}, их кол-во = ${func.arguments}`);
				}
				args.unshift(parseFloat(t.value))
			}
			let funcRes = Token.Functions[token.value].calc.apply(Token.Functions[token.value].calc,args);
			if(!Number.isNaN(funcRes)) {
				stack.push(new Token("Literal", funcRes));
			} else {
				throw new MathError(`Недопустимые аргументы для функции ${token.value}`);
			}
		} else {
			stack.push(token)
		}
		
	}
	
	return stack[0].value
}


module.exports = count;