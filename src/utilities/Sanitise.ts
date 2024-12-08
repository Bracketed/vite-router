export function sanitise(RouteString: string): string {
	if (RouteString.startsWith('/')) {
		RouteString = RouteString.slice(1);
		return sanitise(RouteString);
	}
	return RouteString;
}
