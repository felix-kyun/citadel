import type z from "zod";
import type { Method } from "./Method";

export interface Contract<
	TBody extends z.ZodType = z.ZodType,
	TQuery extends z.ZodType = z.ZodType,
	TParams extends z.ZodType = z.ZodType,
	TResponse extends z.ZodType = z.ZodType,
> {
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
