const fs = require("fs")
const util = require("util")
const { ast, Fn, Kind } = require("./ast")
const { evalAst } = require("./interpreter")

const println = (v) => console.log(util.inspect(v, false, null, true))
const content = fs.readFileSync("./test.lsp", { encoding: "utf8" })
const tree = ast(content)

// println(tree)
evalAst(tree)







module.exports = { println, Kind, Fn, evalAst }
