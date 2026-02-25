export * from "./types";

import z from "zod";
import type { BaseContract, Contract, Method } from "./types";

export function defineContract<
	TBody extends z.ZodRawShape = Record<string, never>,
	TQuery extends z.ZodRawShape = Record<string, never>,
	TParams extends z.ZodRawShape = Record<string, never>,
	TResponse extends z.ZodRawShape = Record<string, never>,
>(
	contract: BaseContract<TBody, TQuery, TParams, TResponse>,
): Contract<TBody, TQuery, TParams, TResponse> {
	return {
		...contract,
		payload: {
			body: contract.payload?.body ?? z.object<TBody>(),
			query: contract.payload?.query ?? z.object<TQuery>(),
			params: contract.payload?.params ?? z.object<TParams>(),
		},
		response: z.object({
			code: z.string(),
			data: contract.response,
		}),
		errors: contract.errors ?? [],
	};
}

export const methods: Record<Method, Method> = {
	get: "get",
	post: "post",
	put: "put",
	patch: "patch",
	delete: "delete",
};
