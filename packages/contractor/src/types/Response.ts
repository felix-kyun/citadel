import type z from "zod";

export type Response<TResponse extends z.ZodRawShape> = z.ZodObject<{
    code: z.ZodString;
    data?: z.ZodObject<TResponse>;
}>;
