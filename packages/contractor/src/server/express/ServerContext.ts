import type { Request, Response } from "express";
import type z from "zod";
import type { Contract } from "../../types/Contract";
import type {
	InferErrors,
	InferPayload,
	InferResponse,
} from "../../types/utils";

export type ServerContext<TContract extends Contract = Contract> = {
	req: Request<
		InferPayload<TContract>["params"],
		InferResponse<TContract>,
		InferPayload<TContract>["body"],
		InferPayload<TContract>["query"]
	>;
	res: Response<InferResponse<TContract>>;
	errors: {
		[Error in InferErrors<TContract>[number] as Error["code"]]: (
			ctx: z.infer<Error["ctx"]>,
		) => {
			code: Error["code"];
			status: Error["status"];
			ctx: z.infer<Error["ctx"]>;
		};
	};
	success: (ctx: InferResponse<TContract>) => {
		code: "success";
		status: TContract["status"];
		ctx: InferResponse<TContract>;
	};
};
