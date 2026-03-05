import z from "zod";
import type { Contract } from "./types/Contract";
import type { Method } from "./types/Method";

/*
 * Extracts the parameters from a route string.
 * Returns a Record of parameter names to string values.
 * Default: Record<string, never>
 */
type ExtractParams<TRoute extends string> =
	TRoute extends `${infer _TPrefix}:${infer TParam}/${infer TSuffix}`
		? { [K in TParam | keyof ExtractParams<TSuffix>]: string }
		: TRoute extends `${infer _TPrefix}:${infer TParam}`
			? { [K in TParam]: string }
			: Record<string, never>;

/*
 * Checks if the string has any parameters.
 * If so, returns a zod type representing the parameters.
 */
type Params<TRoute extends string> = z.ZodType<
	ExtractParams<TRoute> extends Record<string, never>
		? z.ZodNever
		: ExtractParams<TRoute>
>;

/*
 * Defines the payload for a contract.
 */
type Payload<
	TBody extends z.ZodType,
	TQuery extends z.ZodType,
	TParamString extends string,
> =
	ExtractParams<TParamString> extends Record<string, never>
		? { body?: TBody; query?: TQuery }
		: { body?: TBody; query?: TQuery; params: Params<TParamString> };

/*
 * Helper for Converting user input to a well defined Contract object.
 * Applies z.never() to missing field.
 */
export function defineContract<
	TMethod extends Method = Method,
	TRoute extends string = "",
	TBody extends z.ZodType = z.ZodNever,
	TQuery extends z.ZodType = z.ZodNever,
	TResponse extends z.ZodType = z.ZodNever,
>(contract: {
	method: TMethod;
	route: TRoute;
	payload?: Payload<TBody, TQuery, TRoute>;
	response?: TResponse;
}): Contract<TBody, TQuery, Params<TRoute>, TResponse> {
	// extract payload
	const params = ((contract.payload !== null &&
		typeof contract.payload === "object" &&
		"params" in contract.payload &&
		contract.payload?.params) ??
		z.never()) as Params<TRoute>;

	return {
		method: contract.method,
		route: contract.route,
		payload: {
			body: (contract.payload?.body ?? z.never()) as TBody,
			query: (contract.payload?.query ?? z.never()) as TQuery,
			params,
		},
		response: z.object({
			code: z.string(),
			data: (contract.response ?? z.never()) as TResponse,
		}),
	};
}
