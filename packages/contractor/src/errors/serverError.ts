import z from "zod";
import { createError } from "../types/ContractError";

export const serverError = createError({
	status: 500,
	message: "Internal Server Error",
	code: "serverError",
	ctx: z.never(),
});
