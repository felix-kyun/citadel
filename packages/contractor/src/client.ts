import type { Contract } from "./types/Contract";
import z from "zod";
import { defineContract } from "./defineContract";

type BaseContract = Contract<
    z.ZodRawShape,
    z.ZodRawShape,
    z.ZodRawShape,
    z.ZodRawShape
>;

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
    [K in keyof T]: T[K] extends BaseContract
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
            body: z.object().optional(),
            params: z.object().optional(),
            query: z.object().optional(),
        })
        .optional(),
    response: z.object().optional(),
});

interface SchemaNode {
    [key: string]: SchemaNode | BaseContract;
}

function isContract(
    schema: SchemaNode | BaseContract,
): schema is Contract<
    z.ZodRawShape,
    z.ZodRawShape,
    z.ZodRawShape,
    z.ZodRawShape
> {
    return contractSchema.safeParse(schema).success;
}

async function fetchClient<T extends Contract>(
    contract: T,
    payload: InferPayload<T>,
): Promise<InferResponse<T>> {}

function buildSchema<T extends SchemaNode>(schema: T): ClientSchema<T> {
    return Object.fromEntries(
        Object.entries(schema).map(([key, value]) => {
            if (isContract(value)) {
                return [
                    key,
                    (payload: InferPayload<typeof value>) => {
                        return fetchClient(value, payload);
                    },
                ];
            } else {
                return [key, buildSchema(value)];
            }
        }),
    );
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
client.test({});
