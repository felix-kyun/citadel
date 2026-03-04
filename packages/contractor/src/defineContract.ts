import z from "zod";
import type { Method } from "./types/Method";
import type { Contract } from "./types/Contract";

export function defineContract<
	TBody extends z.ZodType = z.ZodNever,
	TQuery extends z.ZodType = z.ZodNever,
	TParams extends z.ZodType = z.ZodNever,
	TResponse extends z.ZodType = z.ZodNever,
>(contract: {
	method: Method;
	route: string;
	payload?: {
		body?: TBody;
		query?: TQuery;
		params?: TParams;
	};
	response?: TResponse;
}): Contract<TBody, TQuery, TParams, TResponse> {
	return {
		method: contract.method,
		route: contract.route,
		payload: {
			body: (contract.payload?.body ?? z.never()) as TBody,
			query: (contract.payload?.query ?? z.never()) as TQuery,
			params: (contract.payload?.params ?? z.never()) as TParams,
		},
		response: z.object({
			code: z.string(),
			data: (contract.response ?? z.never()) as TResponse,
		}),
	};
}
