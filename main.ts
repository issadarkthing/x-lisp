const { ast, Fn, Kind } = require("./ast")
const { evalAst } = require("./interpreter")


export function println<T>(value: T) {
	console.log(Deno.inspect(value, { depth: Infinity }))
}

const decode = new TextDecoder("utf-8")
const content = Deno.readFileSync("./test.lsp")
const tree = ast(decode.decode(content))

// println(tree)
evalAst(tree)







