import { describe, expect, it } from "vitest";
import { stringifyParams } from "../src/stringifyParams";

describe("Utils", () => {
	describe("stringifyParams", () => {
		it("should return empty string with no params", () => {
			const result = stringifyParams("", {});
			expect(result).toBe("");
		});

		it("should keep the path intact when no params are provided", () => {
			const result = stringifyParams("/users", {});
			expect(result).toBe("/users");
		});

		it("should replace params when path begins with a param", () => {
			const result = stringifyParams("/:id", { id: 1 });
			expect(result).toBe("/1");
		});

		it("should replace params when the path contains multiple params", () => {
			const result = stringifyParams("/:id/:name", {
				id: 1,
				name: "Felix",
			});
			expect(result).toBe("/1/Felix");
		});

		it("should replace params when the path contains a query string", () => {
			const result = stringifyParams("/:id?foo=bar", { id: 1 });
			expect(result).toBe("/1?foo=bar");
		});

		it("should replace multiple params", () => {
			const result = stringifyParams(
				"/user/:userId/vault/:vaultId/item/:itemId",
				{
					userId: 1,
					vaultId: 2,
					itemId: 3,
				},
			);
			expect(result).toBe("/user/1/vault/2/item/3");
		});
	});
});
