import type { Contract } from "../types/Contract";
import type {
    InferPayload,
    InferResponse,
    ClientOptions,
    FilterNever,
} from "../types/utils";
import { fetchClient } from "./fetchClient";
import z from "zod";

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

function isContract(schema: SchemaNode | Contract): schema is Contract {
    return contractSchema.safeParse(schema).success;
}

type Transform<T> = {
    [K in keyof T]: T[K] extends Contract
        ? (
              payload: FilterNever<InferPayload<T[K]>>,
          ) => Promise<InferResponse<T[K]>>
        : Transform<T[K]>;
};

interface SchemaNode {
    [key: string]: SchemaNode | Contract;
}

function buildSchema<T extends SchemaNode>(
    root: T,
    options: ClientOptions,
): Transform<T> {
    return Object.fromEntries(
        Object.entries(root).map(([key, value]) => {
            if (isContract(value)) {
                return [
                    key,
                    (payload) => {
                        return fetchClient(value, payload, options);
                    },
                ];
            } else {
                return [key, buildSchema(value, options)];
            }
        }),
    );
}

export function createClient<T extends SchemaNode>(
    schema: T,
    options: ClientOptions,
) {
    return buildSchema(schema, options);
}
