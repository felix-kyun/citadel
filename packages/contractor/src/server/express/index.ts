import type { Request, Response } from "express";
import type z from "zod";
import type { Contract } from "../../types/Contract";
import type { ContractError } from "../../types/ContractError";
import type { SchemaNode } from "../../types/SchemaNode";
import type { InferErrors, InferResponse } from "../../types/utils";
import { isContract } from "../../utils/isContract";
import type { ServerContext } from "./ServerContext";

function buildErrorMap<TContract extends Contract>(contract: TContract) {
	const errors: Record<string, unknown> = {};

	for (const error of contract.errors) {
		errors[error.code] = (ctx: z.infer<typeof error.ctx>) => ({
			...error,
			ctx,
		});
	}

	return errors as ServerContext<TContract>["errors"];
}

type MapErrorsToReturnType<TErrors extends ContractError> =
	TErrors extends ContractError
		? TErrors extends ContractError<infer TCode, infer TContext>
			? {
					code: TCode;
					status: number;
					ctx: z.infer<TContext>;
				}
			: never
		: never;

type Handler<TContract extends Contract = Contract> = (
	ctx: ServerContext<TContract>,
) => Promise<
	| {
			code: "success";
			status: number;
			ctx: InferResponse<TContract>;
	  }
	| MapErrorsToReturnType<InferErrors<TContract>[number]>
>;

type ExpressHandler = (req: Request, res: Response) => Promise<void>;

type Transform<T> = {
	[K in keyof T]: T[K] extends Contract
		? (handler: Handler<T[K]>) => ExpressHandler
		: Transform<T[K]>;
};

type ServerOptions = {};
function buildSchema<T extends SchemaNode>(
	root: T,
	options: ServerOptions,
): Transform<T> {
	return Object.fromEntries(
		Object.entries(root).map(([key, value]) => {
			if (isContract(value)) {
				return [
					key,
					(handler) => async (req: Request, res: Response) => {
						// create context
						const ctx = {
							req,
							res,
							errors: buildErrorMap(value),
							success: (ctx: InferResponse<typeof value>) => ({
								code: "success",
								status: value.status,
								ctx: ctx as InferResponse<typeof value>,
							}),
						} as Parameters<typeof handler>[0];

						const response = await handler(ctx);

						if (response.code === "success") {
							res.status(response.status).json({
								code: "success",
								ctx: response.ctx,
							});
						} else {
							res.status(response.status).json({
								code: response.code,
								ctx: response.ctx,
							});
						}
					},
				];
			} else {
				return [key, buildSchema(value, options)];
			}
		}),
	);
}

export function createExpressServer<T extends SchemaNode>(
	root: T,
	options: ServerOptions,
) {
	return buildSchema(root, options);
}
