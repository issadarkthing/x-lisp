import {InvalidTypeError} from "./error.ts"


// closure
// Function type
export class Fn {

	name: string | undefined
	args: Array<Fn | Kind>
	parent: Fn | undefined
	vars: Map<string, Kind | Fn>

	constructor(name?: string) {
		this.name = name
		this.args = []
		this.parent
		this.vars = new Map()
	}

	show() {
		return this.toString()
	}
}

type Primitives = "number" | "string" | "nil" | "bool" | "identifier" | "cons"
type InputTypes = string | number | Kind[] | undefined
type InternalTypes = Omit<InputTypes, "undefined">


// primitive type
export class Kind {

	type: Primitives
	data: InternalTypes

	constructor(data: InputTypes) {
		this.type = this.identifyType(data)
		this.data = this.castType(data)
	}

	identifyType(data: InputTypes) {

		if (Array.isArray(data)) {
			return "cons"
		} else if (data == undefined || data == "nil") {
			return "nil"
		} else if (isNumeric(data)) {
			return "number"
		} else if (isString(data)) {
			return "string"
		} else if (data === "true" || data === "false") {
			return "bool"
		} else if (isValidVarName(data)) {
			return "identifier"
		} else {
			throw Error("invalid type")
		}
	}

	castType(data: InputTypes): InternalTypes {

		switch (this.type) {
			case "number":
				return Number(data)
			case "string":
				return typeof data === "string" ? data.replace(/"/g, "") : ""
			case "nil":
				return "nil"
			case "cons":
				if (!Array.isArray(data)) 
					throw new Error("Unable to construct cons");
				return data;
			default:
				if (data == undefined)
					throw new Error("Invalid type")
				return data
		}

	}

	show(): string {

		if (this.data == undefined) 
			return "nil"

		if (!Array.isArray(this.data)) {
			return this.data.toString()
		} 

		return	"(" + this.data
			.map(x => x.show()) + ")"
	}

}

function isWhiteSpace(str: string) {
	return /\s+/.test(str)
}

function isNumeric(value: string | number) {
	if (typeof value === "number") return true;
	return /^-{0,1}\d+$/.test(value)
}

function isString(value: string | number) {
	if (typeof value === "number") return false;
	return /".*"/.test(value)
}

export function isValidVarName(str: string | number) {
	if (typeof str === "number") return false;
	return /^[a-zA-Z_][\w\d]*$/.test(str)
}

function removeComment(str: string) {
	return str.replace(/;.*/g, "")
}

function addSpaces(str: string) {
	return str.replace(/\(/g, " ( ").replace(/\)/g, " ) ").trim()
}

function removeSpaces(str: string) {
	return str.replace(/\s+/g, " ")
}

function tokenizer(content: string) {
	return removeSpaces(addSpaces(removeComment(content)))
}

function isBalancedQuote(str: string) {
	return /".*"/.test(str)
}

export function ast(str: string) {

	const root = new Fn("root")
	const tokens = tokenizer(str).split(" ")
	let currNode = root
	let isQuote = false
	let lexeme = ""

	tokens.forEach(v => {

		if (isBalancedQuote(v)) {

			currNode.args.push(new Kind(v))

		} else if (v.includes("\"") && !isQuote) {

			lexeme += v
			isQuote = true

		} else if (v.includes("\"") && isQuote) {

			lexeme += " " + v
			currNode.args.push(new Kind(lexeme))	
			lexeme = ""
			isQuote = false

		} else if (isQuote) {

			lexeme += " " + v

		} else if (v === "(") {

			const node = new Fn()
			node.parent = currNode
			currNode.args.push(node)
			currNode = node

		} else if (v === ")") {

			const parent = currNode.parent
			
			if (parent != undefined) {
				currNode = parent
			}

		} else {

			if (currNode.name == undefined) {
				currNode.name = v
			} else {
				currNode.args.push(new Kind(v))
			}
		}

	})

	return root
}

