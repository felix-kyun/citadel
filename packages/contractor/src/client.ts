import type { Contract } from "./types/Contract";
import z from "zod";
import { defineContract } from "./defineContract";

type InferPayload<T> =
    T extends Contract<infer TBody, infer TQuery, infer TParams, z.ZodRawShape>
        ? {
              body?: z.infer<z.ZodObject<TBody>>;
              query?: z.infer<z.ZodObject<TQuery>>;
              params?: z.infer<z.ZodObject<TParams>>;
          }
        : never;

type InferResponse<T> =
    T extends Contract<
        z.ZodRawShape,
        z.ZodRawShape,
        z.ZodRawShape,
        infer TResponse
    >
        ? z.infer<z.ZodObject<TResponse>>
        : never;

export type ClientSchema<T> = {
    [K in keyof T]: T[K] extends Contract
        ? (payload: InferPayload<T[K]>) => Promise<InferResponse<T[K]>>
        : T[K] extends object
          ? ClientSchema<T[K]>
          : never;
};

export interface ClientOptions {
    baseUrl?: string;
}

const contractSchema = z.object({
    method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
    route: z.string(),
    payload: z
        .object({
            body: z.object(),
            params: z.object(),
            query: z.object(),
        })
        .optional(),
    response: z.object().optional(),
});

interface SchemaNode {
    [key: string]:
        | SchemaNode
        | Contract<z.ZodRawShape, z.ZodRawShape, z.ZodRawShape, z.ZodRawShape>;
}

function isContract(schema: SchemaNode | Contract): schema is Contract {
    return contractSchema.safeParse(schema).success;
}

function buildSchema<T extends SchemaNode>(schema: T) {
    return {} as ClientSchema<T>;
}

const schema = {
    test: defineContract({
        method: "GET",
        route: "/test",
        payload: {
            body: z.object({
                data: z.string(),
            }),
            query: z.object({}),
            params: z.object({}),
        },
        response: z.object({}),
    }),
};

const client = buildSchema(schema);
client.test({ body: { data: "felix" } });
