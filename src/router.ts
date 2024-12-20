import debounce, { DebouncedFunction } from 'debounce';
import fs, { FSWatcher } from 'node:fs';
import path from 'node:path';
import { PluginOption } from 'vite';
import { RouteGenerator } from './generator';
import { Logger } from './logger';
import type { Options } from './types/Exports';

class ViteRouter {
	private readonly configuration: Options;
	private readonly watcher: FSWatcher;
	private readonly generate: DebouncedFunction<() => Promise<void>>;

	constructor(props: Partial<Options> = {}) {
		this.configuration = this.configureDefaults(props);

		this.watcher = fs.watch(this.configuration.dir);
		this.generate = debounce(new RouteGenerator(this.configuration).generate, 100);
	}

	private readonly configureDefaults = (props: Partial<Options> = {}) => {
		// Defines default values
		props.dir ??= 'src/app';
		props.output ??= 'src/Router.tsx';
		props.extensions ??= ['.tsx', '.ts', '.jsx', '.js'];
		props.redirects ??= {};
		props.layouts ??= ['layout.tsx', 'layout.jsx', 'Layout.tsx', 'Layout.jsx'];
		props.meta ??= [
			'.meta.json',
			'.page.json',
			'.info.json',
			'.information.json',
			'.config.json',
			'.configuration.json',
			'.rc.json',
			'.props.json',
			'.properties.json',
		];
		props.router ??= 'BrowserRouter';
		props.root ??= process.cwd();
		props[404] ??= false;
		props.suspense ??= false;

		// Makes sure the paths are absolute
		props.dir = path.resolve(props.root, props.dir);
		props.output = path.resolve(props.root, props.output);

		return props as Options;
	};

	public readonly affix = (): PluginOption => {
		const Constructors = this;

		if (!fs.existsSync(this.configuration.output)) throw new Error('ERR: The output file does not exist');
		if (!fs.existsSync(this.configuration.dir)) throw new Error('ERR: The pages directory does not exist');

		return {
			name: 'vite-plugin-router',
			enforce: 'pre',

			closeBundle: () => Constructors.watcher.close(),
			configureServer: () => {
				Constructors.watcher.on('change', () => Constructors.generate());

				Logger.info('Vite router is ready');
				Logger.info(`Watching at (${Constructors.configuration.dir})`);
				Constructors.generate();
			},
		};
	};
}

export { ViteRouter };
