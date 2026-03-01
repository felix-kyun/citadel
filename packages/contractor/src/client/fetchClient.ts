import type { Contract } from "../types/Contract";
import type {
    InferPayload,
    ClientOptions,
    InferResponse,
} from "../types/utils";

export async function fetchClient<TContract extends Contract>(
    contract: TContract,
    payload: InferPayload<TContract>,
    options: ClientOptions,
): Promise<InferResponse<TContract>> {
    const { body = {}, params = {}, query = {} } = payload;

    const url = "";

    const raw = await fetch(url, {});
    const response = await raw.json();

    const validatedResponse = contract.response.parse(response);
    if (validatedResponse.code !== "SUCCESS") {
        throw new Error(validatedResponse.code);
    }

    return validatedResponse.data as InferResponse<TContract>;
}
