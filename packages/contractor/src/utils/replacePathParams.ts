export function replacePathParams(
	path: string,
	params: Record<string, unknown>,
) {
	return Object.entries(params).reduce(
		(current, [key, value]) =>
			current.replace(`:${key}`, encodeURIComponent(String(value))),
		path,
	);
}
