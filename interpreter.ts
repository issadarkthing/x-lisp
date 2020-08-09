import { Fn, Kind, isValidVarName } from "./ast.ts"
import { InvalidTypeError } from "./error.ts"
import cloneDeep from "https://raw.githubusercontent.com/lodash/lodash/master/cloneDeep.js"

export function println<T>(value: T) {
	console.log(Deno.inspect(value, { depth: Infinity }))
}


export function evalAst(ast: Fn): Kind {
	
	const keyword = ast.name
	const args = ast.args
	const lispEval = new Evaluator(ast)


	switch (keyword) {

		case "+":
		case "add":
			return lispEval.math(args, "+")

		case "-":
		case "sub":
			return lispEval.math(args, "-")

		case "*":
		case "mul":
			return lispEval.math(args, "*")

		case "/":
		case "div":
			return lispEval.math(args, "/")

		case "print":
			return lispEval.print(args)	

		case "root":
		case "prog":
			let last: Kind | Fn;
			// dont evaluate if no args
			if (ast.args.length === 0)
				return new Kind("nil");

			// returns the last evaluation
			ast.args.forEach((x, i) => {

				if (x instanceof Kind)
					return;

				if (i === ast.args.length - 1) {
					last = evalAst(x)
				} else {
					evalAst(x)
				}
			})

			// @ts-ignore
			return last

		case ">":
		case "gt":
			return lispEval.compare(args.slice(0, 2), ">")

		case ">=":
		case "ge":
			return lispEval.compare(args.slice(0, 2), ">=")

		case "<":
		case "lt":
			return lispEval.compare(args.slice(0, 2), "<")

		case "<=":
		case "le":
			return lispEval.compare(args.slice(0, 2), "<=")

		case "==":
		case "eq":
			return lispEval.compare(args.slice(0, 2), "==")

		case "!=":
		case "ne":
			return lispEval.compare(args.slice(0, 2), "!=")

		case "&&":
		case "and":
			return lispEval.compare(args.slice(0, 2), "&&")

		case "||":
		case "or":
			return lispEval.compare(args.slice(0, 2), "||")

		case "if":
			return lispEval.ifElse(args.slice(0, 3))

		case "id":
			// console.log(args)
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

		case "while":
			return lispEval.while(args.slice(0, 2))

		default:
			return lispEval.fnSymbol(args)			
	}
}

type Args = Array<Fn | Kind>
type Comparator = "==" | "!=" | ">" | ">=" | "<" | "<=" | "&&" | "||"

class Evaluator {

	scope: Fn

	constructor(scope: Fn) {
		this.scope = scope
	}

	// returns array of evaluated args
	// evaluates variables as well
	evalArgs(args: Args) {

		const keyword = this.scope.name
		let currScope: Fn | undefined = this.scope
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

					if (currScope == undefined)
						return x;

					// evaluate variable
					if (x.type === "identifier" && keyword !== "set") {
						// looking up variable by finding it on the outer scope
						const symbol = (x.data as string)
						let value = currScope.vars.get(symbol)
						while (value == undefined) {
							currScope = currScope.parent
							if (currScope == undefined)
								break;
							value = currScope.vars.get(symbol)
						}

						if (value == undefined || value instanceof Fn)
							throw Error("Missing identifier");


						return value
					}

					return x

				})
		}


		return values
	}

	math(val: Args, operation: "+" | "-" | "*" | "/") {

		let fn: (a: number, b: number) => number

		switch (operation) {
			case "+":
				fn = (a, b) => a + b
				break;
			case "-":
				fn = (a, b) => a - b
				break;
			case "*":
				fn = (a, b) => a * b
				break;
			case "/":
				fn = (a, b) => a / b
				break;
		}


		debugger
		const evaledArgs = this.evalArgs(val)

		for (const x of evaledArgs) {
			if (x instanceof Fn || x.type !== "number")
				throw new InvalidTypeError("number", x.show())
		}

		const values = evaledArgs as any as Kind[]

		const result = values.reduce((acc, v, i) => {

			if (i === 0)
				return acc;

			const x = v.data
			if (typeof x !== "number")
				throw new InvalidTypeError("number", v.show())
			return fn(acc, x)
		}, (values[0].data as number))
		return new Kind(result)
	}

	compare(val: Args, operator: Comparator) {

		let fn: (a: Kind, b: Kind) => boolean

		switch (operator) {
			case "<":
				fn = (a, b) => {
					return a.data < b.data
				}
				break;
			case "<=":
				fn = (a, b) => {
					return a.data <= b.data
				}
				break;
			case ">":
				fn = (a, b) => {
					return a.data > b.data
				}
				break;
			case ">=":
				fn = (a, b) => {
					return a.data >= b.data
				}
				break;
			case "==":
				fn = (a, b) => {
					return a.data == b.data
				}
				break;
			case "!=":
				fn = (a, b) => {
					return a.data != b.data
				}
				break;
			case "&&":
				fn = (a, b) => {
					return a.data === "true" && b.data === "true"
				}
				break;
			case "||":
				fn = (a, b) => {
					return a.data === "true" || b.data === "true"
				}
				break;
		}

		const [a, b] = this.evalArgs(val)

		if (a instanceof Fn || b instanceof Fn)
			throw new InvalidTypeError("Kind", "Fn")

		const result = fn(a, b)
		return result ? new Kind("true") : new Kind("false")
	}


	print(args: Args) {
		const res = this.evalArgs(args).map(x => x.show())
		console.log(...res)
		return (args[args.length-1] as Kind)
	}


	ifElse(val: Args) {
		const [pred, then, other] = val
		if (pred instanceof Kind || then instanceof Kind || other instanceof Kind)
			throw new InvalidTypeError("Fn", "Kind")

		const a = evalAst(pred)
		return a.data === "true" ? evalAst(then) : evalAst(other);
	}


	// id function takes one argument and returns first arg
	id(val: Args) {

		// first argument of id function
		const s = val[0]

		if (s instanceof Fn)
			throw new Error("Fn type cannot be argument for id function");

		if (s.type === "identifier")
			return this.evalVariable(s)

		// except for cons function that takes no arg which returns empty cons
		if (s.data === "#" || s.data === "cons") 
			return new Kind([])

		return s
	}

	set(val: Args) {
		const pairs = chunk(val)
		pairs.forEach(([key, value]) => {
			const evaledValue = value instanceof Fn ? evalAst(value) : value
			const parent = this.scope.parent

			if (parent == undefined)
				throw new Error("No parent scope");

			if (key instanceof Fn)
				throw new InvalidTypeError("Kind", "Fn")

			const symbol = key.data
			if (typeof symbol === "string" && isValidVarName(symbol)) {
				// console.log(parent.vars.get(symbol), evaledValue)
				// if (!parent.vars.has(symbol)) {
				// 	parent.vars.set(symbol, evaledValue)
				// }
				parent.vars.set(symbol, evaledValue)
			}
		})
		return (val[val.length - 1] as Kind)
	}

	cons(values: Args) {
		const val = this.evalArgs(values)
		if (val.some(x => x instanceof Fn))
			throw new Error("cons unable to take Fn type as argument");

		return new Kind(val as Kind[])
	}


	car(val: Args) {
		const [list] = this.evalArgs(val)

		if (list instanceof Fn)
			throw new InvalidTypeError("cons", "Fn")

		const internalArray = list.data
		if (!Array.isArray(internalArray))
			throw new InvalidTypeError("cons", typeof internalArray)

		return internalArray.length === 0 ? new Kind("nil") : internalArray[0]
	}


	cdr(val: Args) {
		const [list] = this.evalArgs(val)

		if (list instanceof Fn)
			throw new InvalidTypeError("cons", "Fn")

		const internalArray = list.data
		if (!Array.isArray(internalArray))
			throw new InvalidTypeError("cons", typeof internalArray)

		return internalArray.length === 1 ? new Kind("nil") : new Kind(internalArray.slice(1))
	}

	// defines a function on the parent scope
	defun(val: Args) {

		const [firstArg, secondArg, thirdArg] = val

		if (secondArg instanceof Kind || thirdArg instanceof Kind)
			throw new InvalidTypeError("Fn", "Kind")

		if (firstArg instanceof Fn)
			throw new InvalidTypeError("Kind", "Fn")

		// new function identifier	
		const fnName = firstArg.data

		if (typeof fnName !== "string")
			throw new InvalidTypeError("string", typeof fnName)

		if (!isValidVarName(fnName))
			throw new Error("Invalid identifier name")
		
		// new function arguments
		const fnArgs = secondArg.args
		// new function body
		const fnBody = thirdArg


		// set variable for arguments
		const setqCons = new Fn("set")
		setqCons.args = fnArgs
		// create new scope for defined function
		const progCons = new Fn("prog")
		progCons.args.push(setqCons, fnBody)

		const parent = this.scope.parent
		if (parent == undefined)
			throw new Error("Parent scope not found");


		// TODO: recursive function should have a parent set to outer scope
		// recursive function has the same parent as the base function
		progCons.parent = parent
		fnBody.parent = progCons
		setqCons.parent = progCons
		parent.vars.set(fnName, progCons)


		// TODO: replace recursive function parent with the actual parent
		const recursiveFn = (x: Fn) => {
			x.args.forEach((v) => {
				if (v instanceof Fn) {
					if (v.name === "fact") {
						console.log(v.vars)
					}
					recursiveFn(v)
				}
			})
		}

		// recursiveFn(fnBody)

		return new Kind("prog")
	}

	evalVariable(val: Kind) {

		const name = val.data

		if (typeof name !== "string")
			throw new InvalidTypeError("string", typeof name)

		let env = this.scope
		let value = env.vars.get(name)

		while (value == undefined) {
			if (env.parent == undefined)
				break;
			env = env.parent
			value = env.vars.get(name)
		}

		if (value == undefined)
			throw new Error("Symbol cannot be found");

		if (value instanceof Fn)
			throw new Error("Symbol " + value.name + " is already defined")	

		return value
	}

	// finds function or variable symbol
	fnSymbol(val: Args) {

		const name = this.scope.name
		
		if (name == undefined)
			throw new Error("No scope found");

		let env = this.scope

		// finding the body of the function
		let fn = env.vars.get(name)

		while (fn == undefined) {
			if (env.parent == undefined)
				break;
			env = env.parent
			fn = env.vars.get(name)
		}

		const parent = this.scope.parent
		if (parent == undefined)
			throw new Error("Missing scope");

		if (fn == undefined)
			throw new Error("Symbol cannot be found");

		// if its a variable
		// re-assign to a variable
		if (fn instanceof Kind) {
			const [evaledArg] = this.evalArgs(val.slice(0, 1))

			if (evaledArg instanceof Fn)
				throw new InvalidTypeError("Kind", "Fn")

			env.vars.set(name, evaledArg)
			return evaledArg
		}

		// bind the value to the variable set by the defun
		//
		// definition:
		// (defun a (# b c)
		//		(print b c))
		//	
		//	calling the function:
		//	(a 1 2)
		//
		//	translates into:
		//	(prog
		//		(set b 1 c 2)
		//		(print b c))
		//

		// TODO
		// clue: the values passed to the argument change the parent variable
		
		// passed arguments
		const fnArgs = fn.args[0]

		if (fnArgs instanceof Kind)
			throw new InvalidTypeError("Fn", "Kind");

		// get identifiers
		const setKinds = (fnArgs.args as Kind[])

		const vals = this.evalArgs(val)
		if (vals.some(x => x instanceof Fn))
			throw new InvalidTypeError("Kind", "Fn");

		// get evaluated passed arguments
		const arrKinds = (vals as Kind[])

		// set variables with evaluated arguments
		// E.g: (# a 1 b 2)
		fnArgs.args = (combine(setKinds, arrKinds) as Kind[])

		fn.args = cloneDeep(fn.args)
		// fn.parent = this.scope.parent


		return evalAst(fn)
	}

	while(vals: Args) {
		const [pred, body] = vals

		if (pred instanceof Kind || body instanceof Kind)
			throw new InvalidTypeError("Fn", "Kind");

		let cp = evalAst(pred) // predicate
		if (cp instanceof Fn)
			throw new InvalidTypeError("Kind", "Fn");

		let cb: Fn | Kind = body          // loop body
		while(cp.data === "true") {
			cb = evalAst(body)
			cp = evalAst(pred)
			if (cp instanceof Fn)
				throw new InvalidTypeError("Kind", "Fn");
		}
		if (cb instanceof Fn)
			throw new Error("loop body must be evaluated to Kind");
		return cb
	}
}


function combine<T, U>(arr1: T[], arr2: U[]) {

	const main = arr1.slice(0, arr2.length)

	const res: unknown[] = []

	main.forEach((v, i) => {
		res.push(v, arr2[i])
	})

	return res
}

function chunk<T>(arr: T[]) {

	const chunks = []
	const n = arr.length
	let i = 0

	while (i < n) {
		chunks.push(arr.slice(i, i += 2));
	}

	return chunks;
}

