import qs from "qs";
import z from "zod";
import type { Contract } from "../types/Contract";
import type {
	ClientOptions,
	InferErrors,
	InferPayload,
	InferResponse,
} from "../types/utils";
import { replacePathParams } from "../utils/replacePathParams";

export type ClientResponse<
	TContract extends Contract,
	TContext extends
		| InferResponse<TContract>
		| z.infer<InferErrors<TContract>[number]["ctx"]> = InferResponse<TContract>,
> = {
	status: number;
	headers: Headers;
	ok: boolean;
} & (
	| {
			code: "SUCCESS";
			ctx: TContext;
	  }
	| {
			code: InferErrors<TContract>[number]["code"];
			ctx: z.infer<InferErrors<TContract>[number]["ctx"]>;
	  }
);

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

	const baseSchema = z.object({
		code: z.enum([
			"SUCCESS",
			...(contract.errors.map(
				(e) => e.code,
			) as InferErrors<TContract>[number]["code"][]),
		]),
		ctx: z.unknown(),
	});

	const response = await raw.json();
	const parsed = baseSchema.parse(response);

	if (parsed.code !== "SUCCESS") {
		const ctx = contract.errors
			.find((e) => e.code === parsed.code)
			?.ctx.parse(parsed.ctx);

		return {
			code: parsed.code,
			status: raw.status,
			headers: raw.headers,
			ok: raw.ok,
			ctx: ctx as z.infer<InferErrors<TContract>[number]["ctx"]>,
		};
	} else {
		const validatedResponse = contract.response.parse(response);
		return {
			code: "SUCCESS",
			status: raw.status,
			headers: raw.headers,
			ok: raw.ok,
			ctx: validatedResponse.data as InferResponse<TContract>,
		};
	}
}
