import z from "zod";
import type { Method } from "./types/Method";
import type { Contract } from "./types/Contract";
import type { ExtractParams } from "./types/utils";

type Params<TParamString extends string> = z.ZodType<
    ExtractParams<TParamString> extends Record<string, never>
        ? z.ZodNever
        : ExtractParams<TParamString>
>;

type Payload<
    TBody extends z.ZodType,
    TQuery extends z.ZodType,
    TParamString extends string,
> =
    ExtractParams<TParamString> extends Record<string, never>
        ? { body?: TBody; query?: TQuery }
        : { body?: TBody; query?: TQuery; params: Params<TParamString> };

export function defineContract<
    TBody extends z.ZodType = z.ZodNever,
    TQuery extends z.ZodType = z.ZodNever,
    TParamString extends string = "",
    TResponse extends z.ZodType = z.ZodNever,
>(contract: {
    method: Method;
    route: TParamString;
    payload?: Payload<TBody, TQuery, TParamString>;
    response?: TResponse;
}): Contract<TBody, TQuery, Params<TParamString>, TResponse> {
    // extract payload
    const params = ((contract.payload !== null &&
        typeof contract.payload === "object" &&
        "params" in contract.payload &&
        contract.payload?.params) ??
        z.never()) as Params<TParamString>;

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
