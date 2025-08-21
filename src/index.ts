import chokidar, { FSWatcher } from 'chokidar';
import { cosmiconfigSync } from 'cosmiconfig';
import fs from 'node:fs';
import path from 'node:path';
import type { ModuleNode, ViteDevServer } from 'vite';

import { RouteGenerator } from './generator';

import type { Options } from './types/Exports';

import { Logger } from './utilities/logger';

export * from './components/Exports';
export type * from './types/Exports';

export class ViteRouter {
	public readonly name: string = 'vite-plugin-router';
	public readonly enforce: string = 'pre';

	private readonly VIRTUAL_MODULE_ID: string = `virtual:${this.name}`;
	private readonly RESOLVED_VIRTUAL_MODULE_ID: string = `\0${this.VIRTUAL_MODULE_ID}`;

	private readonly configuration: Options;
	private readonly watcher: FSWatcher;
	private readonly generate: (write?: boolean) => string;
	private readonly logger = new Logger();

	constructor(props: Partial<Options> = {}) {
		this.configuration = this.configureDefaults(props);
		this.generate = new RouteGenerator(this.configuration).generate;

		if (!fs.existsSync(this.configuration.dir)) throw new Error('ERR: The target directory does not exist');

		this.watcher = chokidar.watch(this.configuration.dir, {
			persistent: true,
			ignoreInitial: false, // Fire events for existing files
			depth: Infinity, // Recursive
			followSymlinks: true,
			ignored: this.configuration.ignore,
		});
	}

	private readonly isTypescript = (startDir: string) =>
		cosmiconfigSync('tsconfig', {
			searchPlaces: ['tsconfig.json', 'tsconfig.base.json', 'tsconfig.app.json', 'tsconfig.*.json'],
			stopDir: path.parse(startDir).root,
		}).search(startDir);

	private readonly configureDefaults = (props: Partial<Options>): Options => {
		// Defines default values
		props.base ??= 'src';
		props.dir = props.dir ? props.dir : `${props.base}/app`;

		props.redirects ??= {};
		props.router ??= 'BrowserRouter';
		props.root ??= process.cwd();
		props.suspense ??= false;

		props.meta = (props.meta ?? []).concat(['meta.json', 'config.json', 'props.json']);
		props.extensions = (props.extensions ?? []).concat(['tsx', 'jsx']);
		props.ignore = (props.ignore ?? []).concat(['node_modules/**', '**/Router.*', '**/router.*']);

		// Makes sure the paths are absolute
		props.dir = path.resolve(props.root, props.dir).replace(/\/+$/, '');

		props.output ??= `${props.base}/Router.${this.isTypescript(props.root) ? 'tsx' : 'jsx'}`;
		props.output = path.resolve(props.root, props.output).replace(/\/+$/, '');

		props.onRoutesGenerated ??= () => void 0;

		return props as Options;
	};

	public closeBundle = () => this.watcher.close();
	public configureServer = (server: ViteDevServer) => {
		this.watcher.on('all', () => {
			this.generate();

			const mod: ModuleNode | undefined = server.moduleGraph.getModuleById(this.RESOLVED_VIRTUAL_MODULE_ID);

			if (mod && this.configuration.reload) {
				server.moduleGraph.invalidateModule(mod);
				server.ws.send(
					this.configuration.reload === 'full'
						? {
								type: 'full-reload',
								path: '*',
							}
						: {
								type: 'update',
								updates: [
									{
										type: 'js-update',
										path: this.VIRTUAL_MODULE_ID,
										acceptedPath: this.VIRTUAL_MODULE_ID,
										timestamp: Date.now(),
									},
								],
							}
				);
			}
		});

		this.logger.info('Vite router is ready');
		this.logger.info(`Watching at (${this.configuration.dir})`);
		this.generate();
	};
	public buildStart = () => this.generate();

	//  TODO: finish
	public resolveId(id: string) {
		if (id === this.VIRTUAL_MODULE_ID) return this.RESOLVED_VIRTUAL_MODULE_ID;
		return;
	}
	public load(id: string) {
		if (id === this.RESOLVED_VIRTUAL_MODULE_ID) return this.generate(false);
		return;
	}
}
