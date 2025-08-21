import { globSync } from 'glob';
import fs from 'node:fs';
import path from 'node:path';

import { Builders } from './builders';

import type { VitePagesPluginOptions } from './types';
import type { VitePagesPluginRoute } from './types/Route';

import { Logger } from './utilities/logger';
import { Meta } from './utilities/meta';

function sanitise(RouteString: string): string {
	if (RouteString.startsWith('/')) {
		RouteString = RouteString.slice(1);
		return sanitise(RouteString);
	}
	return RouteString;
}

export class RouteGenerator {
	private readonly builders: Builders = new Builders();
	private readonly props: VitePagesPluginOptions;

	private readonly routes: Array<VitePagesPluginRoute> = [];
	private readonly redirects: Record<string, string>;

	private index: number = 0;

	private readonly console = new Logger();

	constructor(props: VitePagesPluginOptions) {
		this.props = props;
		this.redirects = props.redirects;
	}

	public readonly generate = (write: boolean = true): string => {
		const files = globSync(`${this.props.dir}/**/*.{${this.props.extensions.join(',')}}`, {
			ignore: ['node_modules/**', '**/Router.*', ...this.props.ignore],
		});

		this.console.info(this.props.dir, files, this.props.extensions.join(','));

		for (const filepath of files) {
			let { name, ext, dir } = path.parse(filepath);

			// full relative path without extension
			const relative = `./${path
				.relative(path.resolve(this.props.root, this.props.base), filepath)
				.slice(0, -ext.length)
				.replaceAll('\\', '/')}`;

			const meta = new Meta({ metas: this.props.meta, path: filepath });

			if (meta.exists())
				if (meta.has('route'))
					name = sanitise(meta.get<string>('slug') ?? (meta.get<string>('route') as string));

			if ((name.startsWith('[') && !name.endsWith(']')) || (!name.startsWith('[') && name.endsWith(']'))) {
				// Checks if the filename is not [id]something.ext
				this.console.error(`ERR: The file is not a valid route (${path.relative(this.props.root, filepath)})`);
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
				route: route.toLowerCase().replace(/\[(.+?)\]/g, ':$1'), // this fixed some routes having incorrectly parsed params for some reason
				path: relative.replace(/\/index$/, ''),
				index: this.index++,
				meta: meta.get('props'),
			});
		}

		const imports =
			this.props.router === 'HashRouter'
				? this.routes.map((r) => this.builders.defaultImport(`R${r.index}`, r.path))
				: this.routes.map((r) => this.builders.lazyImport(`R${r.index}`, r.path));

		const redirects = Object.values(this.redirects).map((href, i) => {
			const r = Object.keys(this.redirects)[i];

			return this.builders.component('Route', {
				path: r,
				key: r,
				element: `<Redirect href={"${href}"}/>`,
			});
		});

		const builtRoutes = this.routes.map((r) => {
			const component = this.builders.component(`Page${r.index}`, r.meta);

			return this.builders.component('Route', {
				path: r.route,
				key: r.route,
				element: component,
			});
		});

		const content = this.builders.file(
			this.props.router,
			builtRoutes,
			redirects,
			imports,
			this.props.router === 'BrowserRouter',
			this.props,
			write
		);

		if (this.props.output && this.props.write && write) fs.writeFileSync(this.props.output, content, 'utf-8');

		this.props.onRoutesGenerated(this.routes);

		this.console.info(
			`Generated ${this.routes.length} routes ${write ? `at ${this.props.output}` : `(virtual module)`}`
		);

		return content;
	};
}
