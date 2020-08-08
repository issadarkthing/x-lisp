const { ast } = require("./ast")
const { evalAst } = require("./interpreter")


const stdin = process.stdin
stdin.setEncoding("utf-8")

console.log("(welcome to lisp interpreter)")


stdin.on("data", input => {

	if (input === "(exit)") {
		console.log("exiting lisp repl")
		process.exit()
	} 

	const tree = ast(input)
	evalAst(tree)
})
