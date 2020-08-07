const { Fn, Kind } = require("./ast")
const util = require("util")

const println = (v) => console.log(util.inspect(v, false, null, true))

function evalAst(ast) {
	
	const keyword = ast.name
	const args = ast.args
	const lispEval = new Evaluator(ast)


	switch (keyword) {

		case "+":
		case "add":
			return lispEval.add(args)

		case "-":
		case "sub":
			return lispEval.sub(args)

		case "*":
		case "mul":
			return lispEval.mul(args)

		case "/":
		case "div":
			return lispEval.div(args)

		case "print":
			return lispEval.print(args)	

		case "root":
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
			return lispEval.gt(args.slice(0, 2))

		case ">=":
		case "ge":
			return lispEval.ge(args.slice(0, 2))

		case "<":
		case "lt":
			return lispEval.lt(args.slice(0, 2))

		case "<=":
		case "le":
			return lispEval.le(args.slice(0, 2))

		case "==":
		case "eq":
			return lispEval.eq(args.slice(0, 2))

		case "!=":
		case "ne":
			return lispEval.ne(args.slice(0, 2))

		case "if":
			return lispEval.ifElse(args.slice(0, 3))

		case "id":
			return lispEval.id(args)

		case "set":
			return lispEval.set(args)

		case "defun":
			return lispEval.defun(args)

		case "#":
		case "cons":
			return lispEval.cons(args)

		case "car":
			return lispEval.car(args.slice(0, 1))

		case "cdr":
			return lispEval.cdr(args.slice(0, 1))

		default:
			return lispEval.fnSymbol(args)			
	}
}

class Evaluator {

	constructor(scope) {
		this.scope = scope
	}

	// returns array of evaluated args
	// evaluates variables as well
	evalArgs(args) {

		const keyword = this.scope.name
		let currScope = this.scope
		let values;

		// dont evaluate defun body
		if (keyword === "defun") {
			values = args
		} else {
			// recursively evaluate fn types
			values = args.map(x => {
				const val = x instanceof Fn ? evalAst(x) : x
				return val
			})
			// get value from lexical scope
				.map(x => {

					if (x.type === "variable" && keyword !== "setq") {
						// looking up variable by finding it on the outer scope
						const symbol = x.data
						let value = currScope.vars[symbol]
						while (value == undefined) {
							currScope = currScope.parent
							if (currScope == undefined)
								break;
							value = currScope.vars[symbol]
						}
						return new Kind(value)
					}

					return x

				})
		}


		return values
	}

	add(val) {
		const values = this.evalArgs(val)

		if (values.every(x => x.type === "string")) {
			const result = val.map(x => x.data).join("")
			return new Kind(result)
		}

		const result = values.reduce((acc, v) => acc + v.data, 0)
		return new Kind(result)
	}


	mul(val) {
		const values = this.evalArgs(val)

		const result = values.reduce((acc, v) => acc * v.data, 1)
		return new Kind(result)
	}

	sub(val) {

		const values = this.evalArgs(val)
		
		const result = values.reduce((acc, v, i) => {
			if (i === 0) return acc;

			return acc - v.data
		}, values[0].data)
		return new Kind(result)
	}

	div(val) {
		const values = this.evalArgs(val)

		const result = values.reduce((acc, v, i) => {
			if (i === 0) return acc;

			return acc / v.data
		}, values[0].data)
		return new Kind(result)
	}

	print(args) {
		const res = this.evalArgs(args).map(x => x.show())
		console.log(...res)
		return args[args.length-1]
	}


	ifElse(val) {
		const [pred, then, other] = val
		const a = evalAst(pred)
		return a.data === "true" ? evalAst(then) : evalAst(other);
	}

	eq(values) {
		const [a, b] = this.evalArgs(values)
		const result = a.data === b.data
		return result ? new Kind("true") : new Kind("false")
	}

	ne(values) {
		const [a, b] = this.evalArgs(values)
		const result = a.data !== b.data
		return result ? new Kind("true") : new Kind("false")
	}

	ge(values) {
		const val = this.evalArgs(values)
		const [a, b] = val
		return a.data >= b.data ? new Kind("true") : new Kind("false")
	}

	gt(values) {
		const val = this.evalArgs(values)
		const [a, b] = val
		const res = a.data > b.data ? new Kind("true") : new Kind("false")
		return res
	}

	le(values) {
		const val = this.evalArgs(values)
		const [a, b] = val
		return a.data <= b.data ? new Kind("true") : new Kind("false")
	}

	lt(values) {
		const val = this.evalArgs(values)
		const [a, b] = val
		return a.data < b.data ? new Kind("true") : new Kind("false")
	}

	// id function takes one argument and returns first arg
	id(val) {
		return val[0]
	}

	set(val) {
		const pairs = chunk(val)
		pairs.forEach(([key, value]) => {
			const evaledValue = value instanceof Fn ? evalAst(value) : value
			this.scope.parent.vars[key.data] = evaledValue.data
		})
		return val[val.length - 1]
	}

	cons(values) {
		const val = this.evalArgs(values)
		return new Kind(val)
	}


	car(val) {
		const [list] = this.evalArgs(val)
		return list.data.length === 0 ? new Kind("nil") : list.data[0]
	}


	cdr(val) {
		const [list] = this.evalArgs(val)
		return list.data.length === 1 ? new Kind("nil") : new Kind(list.data.slice(1))
	}

	// defines a function on the parent scope
	defun(val) {
		
		const fnName = val[0].data
		const fnArgs = val[1].args
		const fnBody = val[2]


		const setqCons = new Fn("set")
		setqCons.args = fnArgs
		const progCons = new Fn("prog")
		progCons.args.push(setqCons, fnBody)

		progCons.parent = this.scope.parent
		fnBody.parent = progCons
		setqCons.parent = progCons
		this.scope.parent.vars[fnName] = progCons
	}

	// finds function symbol
	fnSymbol(val) {

		const name = this.scope.name
		let env = this.scope
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

module.exports = { Evaluator, evalAst }
