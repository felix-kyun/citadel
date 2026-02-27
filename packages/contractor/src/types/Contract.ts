import type { Method } from "./Method";
import type z from "zod";
import type { Payload } from "./Payload";
import type { Response } from "./Response";

export interface Contract<
    TBody extends z.ZodRawShape = z.ZodRawShape,
    TQuery extends z.ZodRawShape = z.ZodRawShape,
    TParams extends z.ZodRawShape = z.ZodRawShape,
    TResponse extends z.ZodRawShape = z.ZodRawShape,
> {
    method: Method;
    route: string;
    payload: Payload<TBody, TQuery, TParams>;
    response: Response<TResponse>;
}
