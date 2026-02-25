import type z from "zod";

export type Method = "get" | "post" | "put" | "patch" | "delete";

interface ContractError {
	code: string;
	message: string;
	context: unknown;
}

interface Payload<
	TBody extends z.ZodRawShape,
	TQuery extends z.ZodRawShape,
	TParams extends z.ZodRawShape,
> {
	body: z.ZodObject<TBody>;
	query: z.ZodObject<TQuery>;
	params: z.ZodObject<TParams>;
}

type Response<TResponse extends z.ZodRawShape> = z.ZodObject<{
	code: z.ZodString;
	data?: z.ZodObject<TResponse>;
}>;

export interface BaseContract<
	TBody extends z.ZodRawShape,
	TQuery extends z.ZodRawShape,
	TParams extends z.ZodRawShape,
	TResponse extends z.ZodRawShape,
> {
	method: Method;
	route: string;
	payload?: Partial<Payload<TBody, TQuery, TParams>>;
	response?: z.ZodObject<TResponse>;
	errors?: Array<ContractError>;
}

export interface Contract<
	TBody extends z.ZodRawShape,
	TQuery extends z.ZodRawShape,
	TParams extends z.ZodRawShape,
	TResponse extends z.ZodRawShape,
> {
	method: Method;
	route: string;
	payload: Payload<TBody, TQuery, TParams>;
	response: Response<TResponse>;
	errors: Array<ContractError>;
}
