
.phony: run install

run: *.ts *.lsp
	@deno run --allow-read xlisp.ts test.lsp

install: *.ts
	deno install -f --allow-read xlisp.ts
