import {ast} from "./ast.ts"
import {evalAst, println} from "./interpreter.ts"


const decode = new TextDecoder("utf-8")
const content = Deno.readFileSync("./test.lsp")
const tree = ast(decode.decode(content))

// println(tree)
evalAst(tree)







