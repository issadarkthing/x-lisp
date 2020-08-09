import { ast } from "./ast.ts"
import { evalAst, println } from "./interpreter.ts"


console.log("(Welcome to lisp repl)")
while (true) {
	const input = await ask();
	const output = evalAst(ast(input))
	console.log(`=> ${output.data}`)
}



async function ask(question: string = '', stdin = Deno.stdin, stdout = Deno.stdout) {
  const buf = new Uint8Array(1024);

  // Write question to console
  await stdout.write(new TextEncoder().encode(question));

  // Read console's input into answer
  const n = <number>await stdin.read(buf);
  const answer = new TextDecoder().decode(buf.subarray(0, n));

  return answer.trim();
}
