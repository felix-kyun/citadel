import type z from "zod";

export interface Payload<
    TBody extends z.ZodRawShape,
    TQuery extends z.ZodRawShape,
    TParams extends z.ZodRawShape,
> {
    body: z.ZodObject<TBody>;
    query: z.ZodObject<TQuery>;
    params: z.ZodObject<TParams>;
}
