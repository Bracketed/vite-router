/** @internal */
export interface Route {
	path: string;
	route: string;
	index: number;
	meta?: Record<string, string | boolean | number | undefined>;
}
