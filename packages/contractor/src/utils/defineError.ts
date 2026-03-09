import z from "zod";
import type { ContractError } from "../types/ContractError";

type PartialKey<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function defineError<
	TCode extends string,
	TContext extends z.ZodType = z.ZodNever,
>(
	error: PartialKey<ContractError<TCode, TContext>, "ctx">,
): ContractError<TCode, TContext> {
	return {
		...error,
		ctx: (error.ctx ?? z.never()) as TContext,
	};
}
