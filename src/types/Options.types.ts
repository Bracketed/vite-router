import { Route } from './Route.types';

export interface Options {
	/**
	 * Path to the app directory
	 *
	 * @default 'src/app'
	 */
	dir: string;

	/**
	 * Root of your project
	 *
	 * @default process
	 */
	root: string;

	/**
	 * Output path for the `routes` file.
	 *
	 * @default 'src/Routes.tsx'
	 */
	output: string;

	/**
	 * Match the file extensions to be used for the plugin
	 *
	 * @default ['.tsx', '.ts', '.jsx', '.js']
	 */
	extensions: string[];

	/**
	 * Utilise meta files for routes.
	 *
	 * @default ['meta.json', 'page.json', '.info.json', '.config.json', '.rc.json']
	 */
	meta: string[];

	/**
	 * Utilise redirects in your application.
	 *
	 * @default []
	 */
	redirects: Record<string, string>;

	/**
	 * Matches all layout files
	 *
	 * @default ['layout.tsx', 'layout.jsx']
	 */
	layouts: string[];

	/** Called when the routes are generated */
	onRoutesGenerated?: (routes: Route[]) => void;

	/**
	 * Chooses the router to be used
	 *
	 * @default 'BrowserRouter'
	 */
	router: 'BrowserRouter' | 'HashRouter';
}
