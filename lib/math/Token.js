require("./mathfunctions.js");

class Token {
	static Operators = {
		'+': 1, 
		'-': 1, 
		'*': 2, 
		'/': 2, 
		'^': 3, 
		'%': 2
	};
	
	static Functions = {
		// Exponential 
		"exp": {
			arguments: 1,
			calc: Math.exp
		},
		
		"pow": {
			arguments: 2,
			calc: Math.pow
		},
		
		// Logs
		
		"log": {
			arguments: 1,
			calc: Math.log
		},
		
		"ln": {
			arguments: 1,
			calc: Math.log
		},
		
		"lg": {
			arguments: 1,
			calc: Math.log10
		},
		
		"lb": {
			arguments: 1,
			calc: Math.log2
		},
		
		// Others
		"abs": {
			arguments: 1,
			calc: Math.abs
		},
		
		"ceil": {
			arguments: 1,
			calc: Math.ceil
		},
		
		"floor": {
			arguments: 1,
			calc: Math.floor
		},
		
		"sign": {
			arguments: 1,
			calc: Math.sign
		},
		
		"sqrt": {
			arguments: 1,
			calc: Math.sqrt
		},
		
		"cbrt": {
			arguments: 1,
			calc: Math.cbrt
		},
		
		"fact": {
			arguments: 1,
			calc: Math.fact
		},
		
		// Trigonometric 
		
		"sin": {
			arguments: 1,
			calc: Math.sin
		},
		"cos": {
			arguments: 1,
			calc: Math.cos
		},
		"tan": {
			arguments: 1,
			calc: Math.tan
		},
		"tg": {
			arguments: 1,
			calc: Math.tan
		},
		"ctan": {
			arguments: 1,
			calc: Math.ctan
		},
		"ctg": {
			arguments: 1,
			calc: Math.ctan
		},
		
		
		"arcsin": {
			arguments: 1,
			calc: Math.asin
		},
		"arccos": {
			arguments: 1,
			calc: Math.acos
		},
		
		"arctg": {
			arguments: 1,
			calc: Math.atan
		},
		"arcctg": {
			arguments: 1,
			calc: Math.actan
		},
		
		//Hyporbolic 
		
		"sinh": {
			arguments: 1,
			calc: Math.sinh
		},
		"cosh": {
			arguments: 1,
			calc: Math.cosh
		},
		"sh": {
			arguments: 1,
			calc: Math.sinh
		},
		"ch": {
			arguments: 1,
			calc: Math.cosh
		},
		"tanh": {
			arguments: 1,
			calc: Math.tanh
		},
		"th": {
			arguments: 1,
			calc: Math.tanh
		},
		"ctanh": {
			arguments: 1,
			calc: Math.ctanh
		},
		"cth": {
			arguments: 1,
			calc: Math.ctanh
		},
		
		"arsh": {
			arguments: 1,
			calc: Math.asinh
		},
		"arch": {
			arguments: 1,
			calc: Math.acosh
		},
		"arth": {
			arguments: 1,
			calc: Math.atanh
		},
		"arcth": {
			arguments: 1,
			calc: Math.actanh
		},
	}
	
	static #constants = {
		"pi": Math.PI,
		"π": Math.PI,
		"e": Math.E,
		"φ": (1/2 + Math.sqrt(5)/2),
		"g": 9.80665,
		"c": 299792458
	}
	
	type = null;
	value = null;
	priority;
	argumentsCount;
	
	constructor(type, value) {
		this.type = type;
		if(type === "Operator") {
			this.priority = Token.Operators[value];
		} else if(type === "Function") {
			this.argumentsCount = Token.Functions[value].arguments;
			
		}
		this.value = value;
	}
	
	/**
	@param {String} exp - math expression
	@returns {Array[Token]} list of tokezied params
	*/
	static tokenize(exp, scope) {
		let result = [];
		
		let numberBuffer = [];
		let letterBuffer = [];
		
		exp = exp.replace(/\s+/g, "");
		
		exp = exp.replace(/\÷/g, "/");
		exp = exp.replace(/\*\*/g, "^");
		exp = exp.replace(/\×/g, "*");
		
		exp = exp.replace(/\[/g, "(");
		exp = exp.replace(/\]/g, ")");
		
		exp = exp.replace(/mod/gi, "%");
		exp = exp.replace(/°/gi, "*pi/180");
		
		exp = exp.replace(/\√\(/g, "sqrt(");
		
		exp = exp.split("");
		
		exp.forEach(char => {
			if(this.isDigit(char)) {
				if(result.length && result[result.length-1].type === "Operator" && result[result.length-1].value === "-") {
					result.pop();
					if(result.length && result[result.length-1].type !== "Function Argument Separator" && result[result.length-1].type !== "Left Parenthesis" && result[result.length-1].type !== "Operator") {
						result.push(new Token("Operator", "+"));
					}
					numberBuffer.push("-");
				}
				numberBuffer.push(char);
			} else if(this.isDot(char)) {
				numberBuffer.push(char);
			} else if (this.isLetter(char)) {
				if(numberBuffer.length) {
					emptyNumberBufferAsLiteral();
					result.push(new Token("Operator", "*"));
				}
				letterBuffer.push(char);
			} else if (this.isOperator(char)) {
				emptyNumberBufferAsLiteral();
				emptyLetterBufferAsVariables();
				result.push(new Token("Operator", char));
			} else if (this.isLeftParenthesis(char)) {
				if(letterBuffer.length) {
					result.push(new Token("Function", letterBuffer.join("")));
					letterBuffer=[];
				} else if(numberBuffer.length) {
					emptyNumberBufferAsLiteral();
					result.push(new Token("Operator", "*"));
				}
				if(result[result.length-1] != null && result[result.length-1].type === "Right Parenthesis") {
					result.push(new Token("Operator", "*"));
				}
				result.push(new Token("Left Parenthesis", char));
			} else if (this.isRightParenthesis(char)) {
				emptyLetterBufferAsVariables();
				emptyNumberBufferAsLiteral();
				result.push(new Token("Right Parenthesis", char));
			} else if (this.isComma(char)) {
				emptyNumberBufferAsLiteral();
				emptyLetterBufferAsVariables();
				result.push(new Token("Function Argument Separator", char));
			} else {
				emptyNumberBufferAsLiteral();
				emptyLetterBufferAsVariables();
				result.push(new Token("Illegal Character", char));
			}
		});
		
		if(numberBuffer.length) {
			emptyNumberBufferAsLiteral();
		}
		
		if(letterBuffer.length) {
			emptyLetterBufferAsVariables();
		}
		
		return result;
		
		function emptyLetterBufferAsVariables() {
			if(Token.isVariable(letterBuffer.join(""), scope)) {
				result.push(new Token("Literal", scope[letterBuffer.join("")]))
			} else if(Token.isConstant(letterBuffer.join("").toLowerCase())) {
				result.push(new Token("Literal", Token.#constants[letterBuffer.join("").toLowerCase()]));
			} else {
				for (let i = 0; i < letterBuffer.length; i++) {
					result.push(new Token("Variable", letterBuffer[i]));
				
					if(i < letterBuffer.length - 1) {
						result.push(new Token("Operator", "*"));
					}
				}
			}
			
			letterBuffer = [];
		}

		function emptyNumberBufferAsLiteral() {
			if(numberBuffer.length) {
				if(Token.isDot(numberBuffer[0])) {
					numberBuffer.unshift('0');
				}
				result.push(new Token("Literal", numberBuffer.join("")));
				numberBuffer=[];
			}
		}
  
	}
	
	/**
	@param {String} ch - Character
	@returns {Boolean} true if ch is digit
	*/
	static isDigit(ch) {
		let charCode = ch.charCodeAt(0);
		
		/*
			'0' code is 48
			'9' code is 57
		*/
		return charCode >= 48 && charCode <= 57;
	}
	
	/**
	@param {String} ch - Character
	@returns {Boolean} true if ch is letter
	*/
	static isLetter(ch) {
		let charCode = ch.toLowerCase().charCodeAt(0);
		
		/*
			'a' code is 97
			'z' code is 122
		*/
		return charCode >= 97 && charCode <= 122;
	}
	
	/**
	@param {String} ch - Character
	@returns {Boolean} true if ch is math operator
	*/
	static isOperator(ch) {
		return this.Operators[ch] != null;
	}
	
	/**
	@param {String} ch - Character
	@returns {Boolean} true if ch equals to '('
	*/
	static isLeftParenthesis(ch) {
		return ch === '(';
	}
	
	/**
	@param {String} ch - Character
	@returns {Boolean} true if ch equals to ')'
	*/
	static isRightParenthesis(ch) {
		return ch === ')';
	}
	
	/**
	@param {String} ch - Character
	@returns {Boolean} true if ch equals to ','
	*/
	static isComma(ch) {
		return ch === ',';
	}
	
	/**
	@param {String} ch - Character
	@returns {Boolean} true if ch equals to '.'
	*/
	static isDot(ch) {
		return ch === '.'
	}
	
	/**
	@param {String} name - name of constant
	@returns {Boolean} true if name is one of the math/physics constant
	*/
	static isConstant(name) {
		return this.#constants[name] != null;
	}
	
	/**
	@param {String} name - name of variable
	@param {Object} scope - scope
	@returns {Boolean} true if name is variable
	*/
	static isVariable(name, scope) {
		if(scope == null)
			return false;
		
		return scope[name] != null;
	}
}



module.exports = Token;