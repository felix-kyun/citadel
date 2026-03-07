import qs from "qs";
import type { Contract } from "../types/Contract";
import type {
	ClientOptions,
	InferPayload,
	InferResponse,
} from "../types/utils";
import { replacePathParams } from "../utils/replacePathParams";
import { ClientError } from "./ClientError";

export interface ClientResponse<TContract extends Contract> {
	code: string;
	data: InferResponse<TContract>;
	status: number;
	headers: Headers;
	ok: boolean;
}

export async function fetchClient<TContract extends Contract>(
	contract: TContract,
	payload: InferPayload<TContract>,
	options: ClientOptions,
): Promise<ClientResponse<TContract>> {
	const {
		body = {},
		params = {},
		query = {},
	} = payload as {
		body: Record<string, unknown>;
		params: Record<string, unknown>;
		query: Record<string, unknown>;
	};

	// build url
	const url = new URL(contract.route, options.baseUrl);

	// add build params
	if (Object.keys(params).length > 0) {
		url.pathname = replacePathParams(url.pathname, params);
	}

	// add query
	if (Object.keys(query).length > 0) {
		url.search = qs.stringify(query, {
			skipNulls: true,
		});
	}

	const finalUrl = url.toString();
	const init: RequestInit = {};
	const headers: Record<string, string> = {};

	if (contract.method !== "GET") {
		init.body = JSON.stringify(body);
		headers["Content-Type"] = "application/json";
	}

	const raw = await fetch(finalUrl, {
		...init,
		headers,
	});
	const response = await raw.json();

	const validatedResponse = contract.response.parse(response);
	if (validatedResponse.code !== "SUCCESS") {
		throw new ClientError({
			code: validatedResponse.code,
			other: response,
			status: raw.status,
			headers: raw.headers,
			message: "not implemented",
		});
	}

	// return validatedResponse.data as InferResponse<TContract>;
	return {
		code: validatedResponse.code,
		data: validatedResponse.data as InferResponse<TContract>,
		status: raw.status,
		headers: raw.headers,
		ok: raw.ok,
	};
}
