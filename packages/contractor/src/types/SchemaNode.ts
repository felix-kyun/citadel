import type { Contract } from "./Contract";

export interface SchemaNode {
	[key: string]: SchemaNode | Contract;
}
