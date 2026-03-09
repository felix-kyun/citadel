import z from "zod";
import { defineError } from "../utils/defineError";

export const serverError = defineError({
	status: 500,
	message: "Internal Server Error",
	code: "serverError",
});
