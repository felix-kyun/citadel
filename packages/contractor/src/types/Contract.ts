import type z from "zod";
import type { Method } from "./Method";

export const __contract_type: symbol = Symbol("contract");

export interface Contract<
	TBody extends z.ZodType = z.ZodType,
	TQuery extends z.ZodType = z.ZodType,
	TParams extends z.ZodType = z.ZodType,
	TResponse extends z.ZodType = z.ZodType,
> {
	readonly _type: typeof __contract_type;
	method: Method;
	route: string;
	payload: {
		body: TBody;
		query: TQuery;
		params: TParams;
	};
	response: z.ZodObject<{
		code: z.ZodString;
		data: TResponse;
	}>;
}
