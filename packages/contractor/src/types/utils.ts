import type z from "zod";
import type { Contract } from "./Contract";

export type FilterNever<T> = {
	[K in keyof T as T[K] extends never ? never : K]: T[K];
};

export type InferPayload<T> =
	T extends Contract<infer TBody, infer TQuery, infer TParams, z.ZodType>
		? {
				body: z.infer<TBody>;
				query: z.infer<TQuery>;
				params: z.infer<TParams>;
			}
		: never;

export type InferResponse<T> =
	T extends Contract<z.ZodType, z.ZodType, z.ZodType, infer TResponse>
		? z.infer<TResponse>
		: never;

export interface ClientOptions {
	baseUrl: string;
}

export type Clientfn<TContract extends Contract> = (
	contract: TContract,
	payload: InferPayload<TContract>,
	options: ClientOptions,
) => Promise<InferResponse<TContract>>;
