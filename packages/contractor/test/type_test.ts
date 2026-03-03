import { createClient, defineContract } from "../src/index";
import z from "zod";

const schema = {
    auth: {
        login: defineContract({
            method: "POST",
            route: "/home",
            payload: {
                body: z.object({
                    name: z.string(),
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
});
