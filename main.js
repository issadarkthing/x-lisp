const fs = require("fs")
const util = require("util")


// function type 
// closure
class Fn {
	constructor(name) {
		this.name = name
		this.args = []
		this.parent
		this.vars = {}
	}
}

// primitive type
class Kind {
	constructor(data) {
		this.type = this.identifyType(data)
		this.data = this.castType(data)
	}

	identifyType(data) {
	
		if (isNumeric(data)) {
			return "number"
		} else if (isString(data)) {
			return "string"
		} else if (data === "nil") {
			return "nil"
		} else if (data === "true" || data === "false") {
			return "bool"
		} else if (isValidVarName(data)) {
			return "variable"
		} else if (Array.isArray(data)) {
			return "cons"
		}
	}

	castType(data) {

		if (this.type === "number") {
			return Number(data)
		} else if (this.type === "string") {
			return data.replace(/"/g, "")
		} else {
			return data
		}
	}

	show() {
		return this.type === "cons" ? 
			"(" + this.data + ")" : this.data
	}

}

const println = (v) => console.log(util.inspect(v, false, null, true))

const content = fs.readFileSync("./test.lsp", { encoding: "utf8" })

const v = ast(content)

// println(v)
// evalAst(v)

function evalAst(ast) {
	
	const keyword = ast.name
	const res = ast.args
	let args

	// dont evaluate defun body
	if (keyword === "defun" || keyword === "if") {
		args = res
	} else {
		// recursively evaluate fn types
		args = res.map(x => x instanceof Fn ? evalAst(x) : x)
		// filter undefined values that returned from prog function
			.filter(x => x != undefined)
		// get value from lexical scope
			.map(x => {

				// looking up variable by finding it on the outer scope
				const symbol = x.data
				let scope = ast
				let value = scope.vars[symbol]
				while (value == undefined) {
					scope = scope.parent
					if (scope == undefined)
						break;
					value = scope.vars[symbol]
				}

				if (x.type === "variable" && keyword !== "setq" && value != undefined) {
					const res = new Kind(value)
					return res
				} else {
					return x
				}
			})
	}

	const recApply = (fn) => {
		if (keyword === "setq" || keyword === "defun")
			return fn(ast.parent, ...args)
		// apply arguments to js implementation function
		return fn(...args)
	}


	switch (keyword) {
		case "root":
			return evalAst(ast.args[0])

		case "+":
		case "add":
			return add(args)

		case "-":
		case "sub":
			return sub(args)

		case "*":
		case "mul":
			return mul(args)

		case "/":
		case "div":
			return div(args)

		case "print":
			return recApply((...x) => {
				const xs = x.map(x => x.show())
				console.log(...xs)
			})

		case "prog":
			let last;
			// dont evaluate if no args
			if (ast.args.length === 0)
				return;

			// returns the last evaluation
			ast.args.forEach((x, i) => {
				if (i === ast.args.length - 1) {
					last = evalAst(x)
				} else {
					evalAst(x)
				}
			})
			return last

		case ">":
		case "gt":
			return gt(args)

		case ">=":
		case "ge":
			return ge(args)

		case "<":
		case "lt":
			return lt(args)

		case "<=":
		case "le":
			return le(args)

		case "if":
			return ifElse(args)

		case "id":
			return id(args)

		case "setq":
			return setq(args)

		case "defun":
			return defun(args)

		case "arg":
		case "#":
			return arg(args)

		case "==":
		case "eq":
			return eq(args)

		case "cons":
			return cons(args)

		case "car":
			return car(args)

		case "cdr":
			return cdr(args)

		default:
			return recApply((...x) => {
				return fnSymbol(ast.parent, ast.name, x)
			})
			
	}
}


function isWhiteSpace(str) {
	return /\s+/.test(str)
}

function isNumeric(num) {
  return !isNaN(num)
}

function isString(str) {
	return /".*"/.test(str)
}

function isValidVarName(str) {
	return /^[a-zA-Z]([0-9]|[a-zA-Z])*/.test(str)
}

function eq(...val) {
	const result = val[0].data === val[1].data
	return result ? new Kind("true") : new Kind("false")
}

function add(...val) {

	if (val.every(x => x.type === "string")) {
		const result = val.map(x => x.data).join("")
		return new Kind(result)
	}

	const result = val.reduce((acc, v) => acc + v.data, 0)
	return new Kind(result)
}

function mul(...val) {
	const result = val.reduce((acc, v) => acc * v.data, 1)
	return new Kind(result)
}

function sub(...val) {
	const result = val.reduce((acc, v, i) => {
		if (i === 0) return acc;

		return acc - v.data
	}, val[0].data)
	return new Kind(result)
}


function div(...val) {
	const result = val.reduce((acc, v, i) => {
		if (i === 0) return acc;

		return acc / v.data
	}, val[0].data)
	return new Kind(result)
}

function ifElse(...val) {
	const [pred, then, other] = val
	const a = evalAst(pred)
	return a.data === "true" ? evalAst(then) : evalAst(other)
}

function ge(...val) {
	const [a, b] = val
	return a.data >= b.data ? new Kind("true") : new Kind("false")
}

function gt(...val) {
	const [a, b] = val
	return a.data > b.data ? new Kind("true") : new Kind("false")
}

function le(...val) {
	const [a, b] = val
	return a.data <= b.data ? new Kind("true") : new Kind("false")
}

function lt(...val) {
	const [a, b] = val
	return a.data < b.data ? new Kind("true") : new Kind("false")
}

// id function takes one or more argument and returns the last arg
function id(...val) {
	return val[0]
}


function setq(scope, ...val) {
	const pairs = chunk(val)
	pairs.forEach(([key, value]) => {
		scope.vars[key.data] = value.data
	})
	return val[val.length - 1]
}

function defun(scope, ...val) {
	
	const fnName = val[0].data
	const fnArgs = val[1].args
	const fnBody = val[2]


	const setqCons = new Fn("setq")
	setqCons.args = fnArgs
	const progCons = new Fn("prog")
	progCons.args.push(setqCons, fnBody)

	progCons.parent = scope
	fnBody.parent = progCons
	setqCons.parent = progCons
	scope.vars[fnName] = progCons
}

function fnSymbol(scope, name, ...val) {
	let env = scope
	let fn = env.vars[name]

	while (fn == undefined) {
		env = env.parent
		if (env == undefined)
			break;
		fn = env.vars[name]
	}

	const setq = fn.args[0]
	const vals = val.flat()
	setq.args = combine(setq.args, vals)

	return evalAst(fn)
}

function cons(...val) {
	return new Kind(val.map(x => x.data))
}

function car(val) {
	return val.length === 0 ? new Kind("nil") : val[0]
}


function cdr(...val) {
	return val.length === 0 ? new Kind("nil") : val.slice(1)
}

function arg(...val) {
	return val
}

function combine(arr1, arr2) {

	const main = arr1.slice(0, arr2.length)

	const res = []

	main.forEach((v, i) => {
		res.push(v, arr2[i])
	})

	return res
}

function chunk(arr) {

	const chunks = []
	const n = arr.length
	let i = 0

	while (i < n) {
		chunks.push(arr.slice(i, i += 2));
	}

	return chunks;
}

function ast(str) {

	const root = new Fn("root")
	const tokens = str.split("")

	let currNode = root
	let isQuote = false
	let lexeme = ""
	let prevChar
	let isComment = false

	tokens.forEach(v => {

		if (v === ";") {
			isComment = true
		} else if (v === "\n") {
			isComment = false
		} 

		if (isComment) {
			prevChar = v
			return
		}

		if (v === "(") {
			const node = new Fn()
			node.parent = currNode
			currNode.args.push(node)
			currNode = node
			prevChar = v
			return
		} else if (v === ")") {

			if (lexeme !== "") {
				currNode.args.push(new Kind(lexeme))
				lexeme = ""
			}

			if (currNode.args.length === 1 && currNode.args[0].data !== "prog") {
				currNode.name = "id"
			} else {
				currNode.name = currNode.args[0].data
				currNode.args.shift()
			}
			currNode = currNode.parent
			prevChar = v
			return

		} else if (v === '"' && !isQuote) {
			isQuote = true
		} else if (v === '"' && isQuote) {
			isQuote = false
		} 


		if (isQuote) {
			lexeme += v
			prevChar = v
			return
		}

		if (!isWhiteSpace(v)) {
			lexeme += v	
			prevChar = v
			return
		} 

		// skips whitespace and comment 
		if (isWhiteSpace(v) && isWhiteSpace(prevChar)) {
			prevChar = v
			return
		} else if (!isWhiteSpace(prevChar) && isWhiteSpace(v)) {
			if (lexeme !== "") {
				currNode.args.push(new Kind(lexeme))
				lexeme = ""
			}
			prevChar = v
		}

	})

	return root
}

module.exports = { println, Kind, Fn, evalAst }
