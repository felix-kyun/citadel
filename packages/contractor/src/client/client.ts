import type { Contract } from "../types/Contract";
import type { ClientOptions, FilterNever, InferPayload } from "../types/utils";
import { type ClientResponse, fetchClient } from "./fetchClient";

function isContract(schema: SchemaNode | Contract): schema is Contract {
	return schema && "_type" in schema && schema._type === "contractor/contract";
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
	const localOptions = structuredClone(options);
	// fix base url for use URL
	if (!localOptions.baseUrl.endsWith("/")) {
		localOptions.baseUrl = `${localOptions.baseUrl}/`;
	}

	return buildSchema(schema, localOptions);
}
