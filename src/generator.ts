import fs from 'node:fs/promises';
import path from 'node:path';
import { Builders } from './builders';
import { Hooks } from './hooks';
import { Logger } from './logger';
import type { Layout, Options, Route } from './types/Exports';
import { readMeta } from './utilities/GetMeta';
import { sanitise } from './utilities/Sanitise';
import { walk } from './utilities/Walk';

export class RouteGenerator {
	private readonly paths: AsyncGenerator<string, void, void>;
	private readonly builders: Builders = new Builders();
	private readonly props: Options;

	/** Record<directory, fullPath> */
	private readonly layouts: Record<string, Layout> = {};
	private readonly routes: Route[] = [];
	private readonly redirects: Record<string, string>;

	private index: number = 0;

	constructor(props: Options) {
		this.paths = walk(props.dir);
		this.props = props;
		this.redirects = props.redirects;
	}

	public readonly generate = async (): Promise<void> => {
		for await (const filepath of this.paths) {
			let { base, name, ext, dir } = path.parse(filepath);

			// TODO: Remove this line
			if (name === 'styles') continue;

			// full relative path without extension
			const relative =
				// typescript always uses / as path separator
				`./${path
					.relative(path.dirname(this.props.output), filepath)
					.slice(undefined, -ext.length)}`;

			// Isn't a file route
			if (!this.props.extensions.includes(ext)) continue;

			const Meta = await readMeta(this.props, filepath);

			if (Meta && Meta['$route'])
				if (typeof Meta['$route'] === 'string') name = sanitise(Meta['$route']);
				else Logger.error('$route in Meta files can only be a string.');

			if (Meta && Meta['$Route'])
				if (typeof Meta['$Route'] === 'string') name = sanitise(Meta['$Route']);
				else Logger.error('$Route in Meta files can only be a string.');

			if (Meta && Meta['$location'])
				if (typeof Meta['$location'] === 'string') name = sanitise(Meta['$location']);
				else Logger.error('$location in Meta files can only be a string.');

			if (Meta && Meta['$Location'])
				if (typeof Meta['$Location'] === 'string') name = sanitise(Meta['$Location']);
				else Logger.error('$Location in Meta files can only be a string.');

			if (
				(name.startsWith('[') && !name.endsWith(']')) ||
				(!name.startsWith('[') && name.endsWith(']'))
			) {
				// Checks if the filename is not [id]something.ext
				Logger.error(
					`ERR: The file is not a valid route (${path.relative(
						this.props.root,
						filepath
					)})`
				);
				continue;
			}

			// Is a layout file
			if (this.props.layouts.includes(base)) {
				if (!this.layouts[dir])
					this.layouts[dir] = {
						path: relative.replaceAll('\\', '/'),
						index: this.index++,
					};
				else
					Logger.error(
						`ERR: Multiple layouts found in the same directory (${path.relative(
							this.props.root,
							dir
						)}), using (${path.relative(this.props.root, filepath)}).`
					);

				continue;
			}

			// removes root dir
			let route = dir.slice(this.props.dir.length);
			let param: string | null = null;

			// Only adds filename if it's not index
			if (name !== 'index') {
				// replaces [named] path with :named
				param = name.replace(/\[(.+?)\]/g, ':$1');
				route += `/${param}`;
			}

			// Handle index names
			route = route === '' ? '/' : route.replaceAll('\\', '/');

			this.routes.push({
				route: route.toLowerCase(),
				path: relative.replaceAll('\\', '/').replace('index', ''),
				directory: dir,
				index: this.index++,
				params: param ? [param] : undefined,
				meta: Meta,
			});
		}

		// Finds the layout for each route
		for (const route of this.routes) {
			let dir = route.directory;

			// Finds the layout for the route while our root directory is not reached
			do {
				route.layout = this.layouts[dir];
				dir = path.dirname(dir);
			} while (!route.layout && dir.length >= this.props.dir.length);
		}

		const imports =
			this.props.router === 'HashRouter'
				? this.routes.map((r) => this.builders.defaultImport(`R${r.index}`, r.path))
				: this.routes.map((r) => this.builders.lazyImport(`R${r.index}`, r.path));

		const layoutImports = Object.values(this.layouts).map((l) =>
			this.props.router === 'HashRouter'
				? this.builders.defaultImport(`L${l.index}`, l.path)
				: this.builders.lazyImport(`L${l.index}`, l.path)
		);

		const redirects = Object.values(this.redirects).map(([r, href]) =>
			this.builders.component('Route', { path: r, key: r, element: `<Redirect href={"${href}"}/>` })
		);

		const builtRoutes = this.routes.map((r) => {
			const component = this.builders.component(`R${r.index}`, r.meta);

			return this.builders.component('Route', {
				path: r.route,
				key: r.route,
				element: r.layout
					? this.builders.component(`L${r.layout.index}`, undefined, component)
					: component,
			});
		});

		await new Hooks().new(this.routes);

		await fs.writeFile(
			this.props.output,
			await this.builders.file(
				this.props.router,
				builtRoutes,
				redirects,
				imports,
				layoutImports,
				Boolean(this.props.router === 'BrowserRouter'),
				this.props
			),
			'utf-8'
		);

		this.props.onRoutesGenerated?.(this.routes);

		Logger.info(
			`Generated ${this.routes.length} routes at ${path.relative(this.props.root, this.props.output)}`
		);
	};
}
