import type { Contract } from "../types/Contract";
import type { SchemaNode } from "../types/SchemaNode";

export function isContract(schema: SchemaNode | Contract): schema is Contract {
	return schema && "_type" in schema && schema._type === "contractor/contract";
}
