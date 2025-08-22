/** @internal */
export interface VitePagesPluginRoute {
	path: string;
	route: string;
	meta?: Record<string, string | boolean | number | undefined>;
}
