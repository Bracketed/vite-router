import type { VitePagesPluginRoute } from './Route.types';

export interface VitePagesPluginOptions {
	/**
	 * Path to the app directory
	 *
	 * @default 'src/app'
	 */
	dir: string;

	/**
	 * Root of your project
	 *
	 * @default process.cwd()
	 */
	root: string;

	/**
	 * The base folder for your project
	 *
	 * @default 'src'
	 */
	base: string;

	/**
	 * Write the task output to an output file
	 *
	 * @default false
	 */
	write: boolean;

	/**
	 * Output path for the `routes` file.
	 *
	 * @default 'src/Routes.*'
	 */
	output: string;

	/**
	 * Match the file extensions to be used for the plugin
	 *
	 * @default ['.tsx', '.jsx']
	 */
	extensions: string[];

	/**
	 * Utilise meta files for routes.
	 *
	 * @default ['meta.json', 'config.json', 'props.json']
	 */
	meta: string[];

	/**
	 * Utilise redirects in your application.
	 *
	 * @default []
	 */
	redirects: Record<string, string>;

	/** Called when the routes are generated */
	onRoutesGenerated: (routes: VitePagesPluginRoute[]) => void;

	/**
	 * Chooses the router to be used
	 *
	 * @default 'BrowserRouter'
	 */
	router: 'BrowserRouter' | 'HashRouter';

	/**
	 * Whether which way to reload the vModule
	 *
	 * @default undefined
	 */
	reload?: 'hot' | 'full' | undefined;

	/**
	 * Utilise a loading screen for pages loading.
	 *
	 * @default false
	 */
	suspense: boolean;

	/**
	 * Files or folders to ignore when watching for edits and routing for files.
	 *
	 * @default []
	 */
	ignore: Array<string>;
}
