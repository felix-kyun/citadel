import z from "zod";

type Method = "get" | "post" | "put" | "patch" | "delete";

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

interface BaseContract<
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
