const fs = require("fs")
const { Fn, Kind, println, evalAst } = require("./main")

const content = fs.readFileSync("./test.lsp", { encoding: "utf8" })


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

const tree = ast(content)
println(tree)
// evalAst(tree)
