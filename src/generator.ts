import { globSync } from 'glob';
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

	private readonly console = new Logger();

	constructor(props: VitePagesPluginOptions) {
		this.props = props;
		this.redirects = props.redirects;
	}

	public readonly generate = (): string => {
		const files = globSync(`${this.props.dir.replace(/\\/g, '/')}/**/*.{${this.props.extensions.join(',')}}`, {
			ignore: ['node_modules/**', ...this.props.ignore],
		});

		this.routes.length = 0;

		for (const filepath of files) {
			let { name, ext, dir } = path.parse(filepath);

			const relative = filepath.slice(0, -ext.length).replaceAll('\\', '/');
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
				path: relative.replaceAll('\\', '/').replace('index', ''),
				meta: meta.get('props'),
			});
		}

		const imports = this.routes.map((r, idx) => `const Page${idx} = lazy(() => import('${r.path}'));`);
		const redirects = Object.values(this.redirects).map((href, i) => {
			const r = Object.keys(this.redirects)[i];

			return this.builders.component('Route', {
				path: r,
				key: r,
				element: `<Redirect href={"${href}"}/>`,
			});
		});

		const builtRoutes = this.routes.map((r, idx) => {
			const component = this.builders.component(`Page${idx}`, r.meta);

			return this.builders.component('Route', {
				path: r.route,
				key: r.route,
				element: component,
			});
		});

		this.props.onRoutesGenerated(this.routes);
		this.console.info(`Generated ${this.routes.length} routes (virtual module)`);
		return this.builders.file(builtRoutes, redirects, imports, this.props);
	};
}
