export { defineContract } from "./defineContract";
export type { Contract } from "./types/Contract";

import type { Method } from "./types/Method";
export const methods: Record<Method, Method> = {
    get: "get",
    post: "post",
    put: "put",
    patch: "patch",
    delete: "delete",
};
