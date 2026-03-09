import type z from "zod";

export interface ContractError<
	TCode extends string = string,
	TContext extends z.ZodType = z.ZodType,
> {
	code: TCode;
	status: number;
	message: string;
	ctx: TContext;
}
