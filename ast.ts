const fs = require("fs")

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
		} else if (data === "nil" || data == undefined) {
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

		switch (this.type) {
			case "number":
				return Number(data)
			case "string":
				return data.replace(/"/g, "")
			case "nil":
				return "nil"
			default:
				return data
		}

	}

	show() {
		return this.type === "cons" ? 
			"(" + this.data.map(x => x.type === "cons" ? x.show() : x.data) + ")" : this.data
	}

}

function isWhiteSpace(str) {
	return /\s+/.test(str)
}

function isNumeric(value) {
  return /^-{0,1}\d+$/.test(value)
}

function isString(str) {
	return /".*"/.test(str)
}

function isValidVarName(str) {
	return /^[a-zA-Z]([0-9]|[a-zA-Z])*/.test(str)
}

function removeComment(str) {
	return str.replace(/;.*/g, "")
}

function addSpaces(str) {
	return str.replace(/\(/g, " ( ").replace(/\)/g, " ) ").trim()
}

function removeSpaces(str) {
	return str.replace(/\s+/g, " ")
}

function tokenizer(content) {
	return removeSpaces(addSpaces(removeComment(content)))
}

function isBalancedQuote(str) {
	return /".*"/.test(str)
}

function ast(str) {

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
			
			if (currNode.args.length === 1 && currNode.args[0].data !== "prog") {
				currNode.name = "id"
			} else {
				currNode.name = currNode.args[0].data
				currNode.args.shift()
			}

			currNode = currNode.parent

		} else {
			currNode.args.push(new Kind(v))
		}

	})

	return root
}

module.exports = { ast, Fn, Kind }
