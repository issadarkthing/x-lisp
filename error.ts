
export class InvalidTypeError extends Error {

	constructor(expected: string, got: string) {
		const errMessg = `Invalid type: expected ${expected} instead got ${got}`
		super(errMessg);
		this.name = "TypeError"
	}

}


