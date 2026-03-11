import z from "zod";
import type { Contract } from "./types/Contract";
import type { ContractError } from "./types/ContractError";
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
type Params<TRoute extends string> =
	ExtractParams<TRoute> extends Record<string, never>
		? z.ZodNever
		: z.ZodType<ExtractParams<TRoute>>;

/*
 * Defines the payload for a contract.
 */
type Payload<
	TMethod extends Method,
	TRoute extends string,
	TBody extends z.ZodType,
	TQuery extends z.ZodType,
> = ([TMethod] extends ["GET"] ? NonNullable<unknown> : { body: TBody }) &
	(ExtractParams<TRoute> extends Record<string, never>
		? NonNullable<unknown>
		: { params: Params<TRoute> }) &
	([TQuery] extends [z.ZodNever] ? NonNullable<unknown> : { query: TQuery });

/*
 * Helper for Converting user input to a well defined Contract object.
 * Applies z.never() to missing field.
 */
export function defineContract<
	TMethod extends Method = Method,
	TRoute extends string = string,
	TBody extends z.ZodType = z.ZodNever,
	TQuery extends z.ZodType = z.ZodNever,
	TResponse extends z.ZodType = z.ZodNever,
	const TErrors extends Array<ContractError> = [],
>(contract: {
	method: TMethod;
	route: TRoute;
	status?: number;
	payload?: Payload<TMethod, TRoute, TBody, TQuery>;
	response?: TResponse;
	errors?: TErrors;
}): Contract<TBody, TQuery, Params<TRoute>, TResponse, TErrors> {
	// extract payload
	const params = ((contract.payload &&
		"params" in contract.payload &&
		contract.payload?.params) ??
		z.never()) as Params<TRoute>;

	const body = ((contract.payload as { body?: unknown })?.body ??
		z.never()) as TBody;
	const query = ((contract.payload as { query?: unknown })?.query ??
		z.never()) as TQuery;

	return {
		_type: "contractor/contract" as const,
		method: contract.method,
		route: contract.route,
		status: contract.status ?? 200,
		payload: {
			body,
			query,
			params,
		},
		response: z.object({
			code: z.string(),
			data: (contract.response ?? z.never()) as TResponse,
		}),
		errors: (contract.errors ?? []) as TErrors,
	};
}
