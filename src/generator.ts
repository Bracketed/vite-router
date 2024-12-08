import fs from 'node:fs/promises';
import path from 'node:path';
import { Builders } from './builders';
import { Hooks } from './hooks';
import { Logger } from './logger';
import type { Layout, Options, Route } from './types/Exports';
import { readMeta } from './utilities/GetMeta';
import { walk } from './utilities/Walk';

export class RouteGenerator {
	private readonly paths: AsyncGenerator<string, void, void>;
	private readonly builders: Builders = new Builders();
	private readonly props: Options;

	/** Record<directory, fullPath> */
	private readonly layouts: Record<string, Layout> = {};
	private readonly routes: Route[] = [];

	private index: number = 0;

	constructor(props: Options) {
		this.paths = walk(props.dir);
		this.props = props;
	}

	public readonly generate = async (): Promise<void> => {
		for await (const filepath of this.paths) {
			const { base, name, ext, dir } = path.parse(filepath);

			// TODO: Remove this line
			if (name === 'styles') continue;

			// full relative path without extension
			const relative =
				// typescript always uses / as path separator
				`./${path.relative(path.dirname(this.props.output), filepath).slice(undefined, -ext.length)}`;

			// Isn't a file route
			if (!this.props.extensions.includes(ext)) continue;

			const Meta = await readMeta(this.props, filepath);

			if (
				(name.startsWith('[') && !name.endsWith(']')) ||
				(!name.startsWith('[') && name.endsWith(']'))
			) {
				// Checks if the filename is not [id]something.ext
				Logger.error(
					`ERR: The file is not a valid route (${path.relative(this.props.root, filepath)})`
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
				param = name.replace(/\[(.+?)\]/g, ':$1');
				// replaces [named] path with :named
				route += `/${param}`;
			}

			this.routes.push({
				// Handle index names
				route: route === '' ? '/' : route.replaceAll('\\', '/'),
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

		const builtRoutes = this.routes.map((r) => {
			const component = this.builders.component(`R${r.index}`, r.meta);

			return this.builders.component('Route', {
				path: `"${r.route.toLowerCase()}"`,
				key: `"${r.route.toLowerCase()}"`,
				element: r.layout
					? this.builders.component(`L${r.layout.index}`, undefined, component)
					: component,
			});
		});

		await new Hooks().new(this.routes);

		await fs.writeFile(
			this.props.output,
			this.builders.file(
				this.props.router,
				builtRoutes,
				imports,
				layoutImports,
				Boolean(this.props.router === 'BrowserRouter')
			),
			'utf-8'
		);

		this.props.onRoutesGenerated?.(this.routes);

		Logger.info(
			`Generated ${this.routes.length} routes at ${path.relative(this.props.root, this.props.output)}`
		);
	};
}
