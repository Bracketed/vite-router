<div align="center" id="top">
    <img src="https://raw.githubusercontent.com/Bracketed/Bracketed-Packages/main/assets/LogoText.png" alt="Bracketed logo" width="800"/>
    <br />
    Bracketed Softworks - <a href="https://bracketed.co.uk" >Website</a> | <a href="https://discord.com/invite/JZ4939cvMT" >Discord</a> | <a href="https://github.com/Bracketed" >Github</a>
</div>

<br>

<h2 align="center" >@bracketed/vite-plugin-router</h2>

A fork of [vite-plugin-router](https://github.com/felipe-bergamaschi/vite-router) by Felipe Bergamaschi, enhanced to work with slightly more advanced methods, such as having meta files which can add extra props to your Route components.
This is a plugin built revolving around [Vite](https://vite.dev/) to allow the ease of a fast, comprehensive and facilitative Router system in your Vite + React + Typescript/JavaScript applications.

**NOTICE:** Does not support versions below react-router v6

<h2>Summary (Directory)</h2>

- [Installation](#Installation)
  <!--truncate-->
     - [Yarn](#YarnInstall)
     - [Npm](#NpmInstall)
     - [Vite](#ViteInstall)
- [Usage](#Usage)
- [Contribution](#Contribution)
- [Licence](#Licence)

<h2 id="Installation">Installation</h2>

Install via `yarn` or `npm`:

<p id="YarnInstall">Yarn:</p>

```sh
yarn install -D @bracketed/vite-plugin-router
yarn install react-router react-router-dom
```

<p id="NpmInstall">Npm:</p>

```sh
npm install -D @bracketed/vite-plugin-router
npm install react-router react-router-dom
```

<p id="NpmInstall">Update Vite config</p>

Add to your `vite.config.js`:

```js
import Routes from '@bracketed/vite-plugin-router';

export default {
	plugins: [
		// ...
		new ViteRouter().affix(),
	],
};
```

<h2 id="Usage">Usage</h2>

By default, @bracketed/vite-plugin-router creates a route file in the `src/` directory containing all
the route settings for your application, while observing the files within `src/app`.

Routes are configured using the [Suspense API](https://react.dev/reference/react/Suspense)
of `react-router` by default.

This package also exports its typings via `@bracketed/vite-plugin-router/types` and its hooks via `@bracketed/vite-plugin-router/hooks`.

### React

Create `app` folder within `src/` and add `index.tsx` file. Export a default component as
an example:

```js
export default function Page() {
	return (
		<div>
			<h1>Vite Router</h1>
		</div>
	);
}
```

Run your application `npm run dev`, and you will be able to observe the `(VITE ROUTER)`
logs and find the 'routes' file created.

Add `AppRoutes` to your `main.tsx`:

```js
import React from 'react'
import ReactDOM from 'react-dom/client'
// ...
import { AppRoutes } from './routes'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>,
)
```

## Configuration

To use custom configuration, pass your options to Pages when instantiating the plugin:

```js
// vite.config.js
import { defineConfig } from 'vite';
import Routes from '@bracketed/vite-plugin-router';

export default defineConfig({
	plugins: [
		new ViteRouter().affix({
			dir: 'src/app',
			output: 'src',
		}),
	],
});
```

### root

- **Type:** `string`
- **Default:** `process`

The project pwd by default, where your project is currently.

### dir

- **Type:** `string`
- **Default:** `'src/app'`

Path to the pages directory.

### output

- **Type:** `string`
- **Default:** `'src'`

Output path for the `Routes` file.

### router

- **Default:**
     - `BrowserRouter`

Chooses the router to be used.

### layouts

- **Default:**
     - `['layout.tsx', 'layout.jsx']`

### extensions

- **Default:**
     - `['tsx', 'jsx', 'ts', 'js']`

The types of files the router will search for.

### meta

- **Default:**
     - `['.meta.json', '.page.json', '.info.json', '.information.json', '.config.json', '.configuration.json', '.rc.json', '.json', '.props.json', 'properties.json',]`

The types of meta the router will search for so extra props can be added to Route components.

### redirects

- **Default:**
     - `{}`

Redirect routes in your application.
Formatted as this example:

```json
{
	"redirects/discord": "https://discord.com",
	"discord": "https://discord.com"
}
```

### onRoutesGenerated

- **Default:**
     - `void` (none)

A function to call upon the generation of the route handler.
Parameters: (`Array<Route>`)

## File System Routing

Inspired by the routing from
[NextJS](https://nextjs.org/docs/pages/building-your-application/routing)

'Vite router' simplifies the process of creating routes for your vite application by
automatically generating a 'routes' file based on the structure of the `.tsx` files in
your pages directory. With this approach, connecting to your vite application becomes
effortless, as no additional configuration is needed on your part.

### Basic Routing

Pages will automatically map files from your pages directory to a route with the same
name:

- `src/app/users.tsx` -> `/users`
- `src/app/users/profile.tsx` -> `/users/profile`
- `src/app/settings.tsx` -> `/settings`

### Index Routes

Files with the name `index` are treated as the index page of a route:

- `src/app/index.tsx` -> `/`
- `src/app/users/index.tsx` -> `/users`

### Dynamic Routes

Dynamic routes are denoted using square brackets. Both directories and pages can be
dynamic:

- `src/app/users/[id].tsx` -> `/users/:id` (`/users/123`)
- `src/app/users/[user]/settings.tsx` -> `/users/:user/settings` (`/users/123/settings`)

### Layouts

We can utilize 'layout' files to create nested layouts from the parent. By naming a
specific file 'layout' and defining its child routes within it, we can establish a
hierarchical structure for our application. This approach enhances the organization and
management of routes, making it easier to maintain and extend the application.

For example, this directory structure:

```
src/app/
    ├── users/
    │  ├── index.tsx
    │  └── layout.tsx
    └── index.tsx
```

### Meta Files

We can utilise a Meta file for a page, using `[PAGE-NAME].meta.json` or any custom names via the `meta` property of the Router initialiser.
Meta files will include objects which will be added to your page object in the generated Routes file.

Meta files can use various endings for the file name to work, these are configurable in `meta`, inside your Router initialiser:

- `.meta.json`
- `.page.json`
- `.info.json`
- `.information.json`
- `.config.json`
- `.configuration.json`
- `.rc.json`
- `.props.json`
- `.properties.json`

This is an example structure on how a meta file will be structured in your environment:

```
src/app/
    ├── users/
    │  ├── index.tsx
    │  ├── index.meta.json
    │  ├── user-info.tsx
    │  └── user-info.meta.json
    └── index.tsx
```

Example of a `.meta.json` file contents:

```json
{
	"Location": "Home",
	"Description": "The homepage of my application."
}
```

In the final product of the `Router.tsx` file, your route object will essentially be like this:

```tsx
<ExamplePage Location={'Home'} Description={'The homepage of my application.'}></ExamplePage>
```

Obviously wrapped in a route object etc.

Using `$Route` or any names of the following names below will customise the route location in the built Routes.

- `$route`
- `$Route`
- `$location`
- `$Location`

Example:

Meta:

```json
{
	"$route": "/home-page"
}
```

Route:

```tsx
<Route
	path={'/home-page'}
	key={'/home-page'}
	element={<R1 Location={'Home'} Description={'The homepage of my application.'}></R1>}></Route>
```

<h2 id="Licence">Licence</h2>

MIT License © 2023-PRESENT [Felipe Bergamaschi](https://github.com/felipe-bergamaschi)
This package is a fork of `vite-plugin-router` by Felipe Bergamaschi, all rights reserved to respected contributors.

<h1 id="Contribution">Contribution & Help</h1>

Feel free to contribute to this project, join our [discord](https://discord.com/invite/JZ4939cvMT) and help us with future developments of Project Bracketed & Packages by Bracketed Softworks.
Please also notify us of errors within our projects as we may not be aware of them at the time.

<br>

<div align="center" style="font-weight: bold">
    <h2>Thanks for using our packages!</h2>
    <img src="https://github.com/Bracketed/Branding/blob/main/Banners/LogoBannerTextMini.png?raw=true" alt="Bracketed logo" width="900" style="border-radius: 25px" />
    Bracketed Softworks - <a href="https://bracketed.co.uk" >Website</a> | <a href="https://discord.com/invite/JZ4939cvMT" >Discord</a> | <a href="https://github.com/Bracketed" >Github</a> | <a href="https://x.com/teambracketed" >Twitter</a> | <a href="#top" >Back To The Top</a>
    <br>
    <br>
    <img src="https://discordapp.com/api/guilds/1041758035355369542/widget.png?style=banner2" alt="Discord Banner" href="https://discord.com/invite/JZ4939cvMT"/>
</div>
