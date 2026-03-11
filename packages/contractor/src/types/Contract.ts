import type z from "zod";
import type { ContractError } from "./ContractError";
import type { Method } from "./Method";

export interface Contract<
	TBody extends z.ZodType = z.ZodType,
	TQuery extends z.ZodType = z.ZodType,
	TParams extends z.ZodType = z.ZodType,
	TResponse extends z.ZodType = z.ZodType,
	TErrors extends ContractError[] = ContractError[],
> {
	readonly _type: "contractor/contract";
	method: Method;
	route: string;
	status: number;
	payload: {
		body: TBody;
		query: TQuery;
		params: TParams;
	};
	response: z.ZodObject<{
		code: z.ZodString;
		data: TResponse;
	}>;
	errors: TErrors;
}
