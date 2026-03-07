interface ClientErrorContext {
	code: string;
	message: string;
	other: unknown;
	status: number;
	headers: Headers;
}

export class ClientError extends Error {
	public ctx: ClientErrorContext;
	constructor(ctx: ClientErrorContext) {
		super(`${ctx.code}: ${ctx.message}`);
		this.ctx = ctx;
		Object.setPrototypeOf(this, ClientError.prototype);
	}
}
