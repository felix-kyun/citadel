import z from "zod";
import { createClient, defineContract } from "../src/index";

const schema = {
	auth: {
		login: defineContract({
			method: "POST",
			route: "/home/:id",
			payload: {
				body: z.object({
					name: z.string(),
				}),
				params: z.object({
					id: z.string(),
				}),
			},
			response: z.object({
				message: z.string(),
			}),
		}),
	},
} as const;

const client = createClient(schema, { baseUrl: "/" });

await client.auth.login({
	body: {
		name: "felix",
	},
	params: {
		id: "",
	},
});
