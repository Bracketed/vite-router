import chokidar, { FSWatcher } from 'chokidar';
import { transform } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import type { ModuleNode, PluginOption, ViteDevServer } from 'vite';

import { RouteGenerator } from './generator';

import type { VitePagesPluginOptions } from './types';

import { isTypescript } from './utilities/isTypescript';
import { Logger } from './utilities/logger';

class ViteRouter {
	public readonly configuration: VitePagesPluginOptions;
	public readonly watcher: FSWatcher;
	public readonly generate: (write?: boolean) => Promise<string>;

	constructor(props: Partial<VitePagesPluginOptions> = {}) {
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

	private readonly configureDefaults = (props: Partial<VitePagesPluginOptions>): VitePagesPluginOptions => {
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

		props.output ??= `${props.base}/Router.${isTypescript(props.root) ? 'tsx' : 'jsx'}`;
		props.output = path.resolve(props.root, props.output).replace(/\/+$/, '');

		props.onRoutesGenerated ??= () => void 0;

		return props as VitePagesPluginOptions;
	};
}

function plugin(props: Partial<VitePagesPluginOptions> = {}) {
	const Router = new ViteRouter(props);
	const logger = new Logger();
	const root = props.root ?? process.cwd();
	const isTs = isTypescript(root);

	const name: string = 'vite-plugin-router';

	const VIRTUAL_MODULE_ID: string = `virtual:${name}.${isTs ? 'tsx' : 'jsx'}`;
	const RESOLVED_VIRTUAL_MODULE_ID: string = `\0${VIRTUAL_MODULE_ID}`;

	return {
		name,
		enforce: 'pre',

		closeBundle: () => Router.watcher.close(),
		configureServer: (server: ViteDevServer) => {
			Router.watcher.on('all', () => {
				Router.generate();

				const mod: ModuleNode | undefined = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);

				if (mod && Router.configuration.reload) {
					server.moduleGraph.invalidateModule(mod);
					server.ws.send(
						Router.configuration.reload === 'full'
							? {
									type: 'full-reload',
									path: '*',
								}
							: {
									type: 'update',
									updates: [
										{
											type: 'js-update',
											path: VIRTUAL_MODULE_ID,
											acceptedPath: VIRTUAL_MODULE_ID,
											timestamp: Date.now(),
										},
									],
								}
					);
				}
			});

			logger.info('Vite router is ready');
			logger.info(`Watching at (${Router.configuration.dir})`);
			Router.generate();
		},
		buildStart: () => {
			Router.generate();
		},

		resolveId: (id: string) => {
			if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID;
			return;
		},
		load: async (id: string) => {
			if (id === RESOLVED_VIRTUAL_MODULE_ID) {
				const code = await Router.generate(false);
				const transformed = await transform(code, { loader: isTs ? 'tsx' : 'jsx' });

				logger.info(transformed.code);

				return transformed.code;
			}
			return;
		},
	} satisfies PluginOption;
}

export { plugin as viteRouter };
export default plugin;
