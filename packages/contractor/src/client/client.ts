import type { Contract } from "../types/Contract";
import type { SchemaNode } from "../types/SchemaNode";
import type { ClientOptions, FilterNever, InferPayload } from "../types/utils";
import { isContract } from "../utils/isContract";
import { type ClientResponse, fetchClient } from "./fetchClient";

type Transform<T> = {
	[K in keyof T]: T[K] extends Contract
		? (
				payload: FilterNever<InferPayload<T[K]>>,
			) => Promise<ClientResponse<T[K]>>
		: Transform<T[K]>;
};

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
