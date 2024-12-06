import { Layout } from './Layout.types';

/** @internal */
export interface Route {
	path: string;
	directory: string;
	route: string;
	index: number;
	layout?: Layout;
	params?: string[];
	meta?: Record<string, string | boolean | number | undefined>;
}
