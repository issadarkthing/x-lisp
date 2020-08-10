import {ast} from "./ast.ts"
import {evalAst, println} from "./interpreter.ts"

async function xlisp(): Promise<void> {

	const files = Deno.args

	for (const file of files) {

		const decode = new TextDecoder("utf-8");
		const content = Deno.readFileSync(file);
		const tree = ast(decode.decode(content));
		// println(tree)
		evalAst(tree);

	}
}

if (import.meta.main) {
	xlisp()
}

// println(tree)
// # vi:syntax=typescript
