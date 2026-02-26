import type z from "zod";
import type { Payload } from "./Payload";
import type { Method } from "./Method";

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
}
