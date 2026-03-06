export function stringifyParams(path: string, params: Record<string, unknown>) {
	return Object.entries(params).reduce(
		(current, [key, value]) => current.replace(`:${key}`, String(value)),
		path,
	);
}
