import z from "zod";
import type { Contract } from "../types/Contract";
import type {
	ClientOptions,
	FilterNever,
	InferPayload,
	InferResponse,
} from "../types/utils";
import { type ClientResponse, fetchClient } from "./fetchClient";

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
			) => Promise<ClientResponse<T[K]>>
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
					(payload: InferPayload<T[typeof key]>) => {
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
	// fix base url for use URL
	if (!options.baseUrl.endsWith("/")) {
		options.baseUrl = `${options.baseUrl}/`;
	}

	return buildSchema(schema, options);
}
