
## Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   └── styles/
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## Architecture

Below is a simple Mermaid diagram showing the frontend structure and relationships between the main folders.

```mermaid
%%{init: {'theme':'base'}}%%
flowchart TB
	Public[public/] -->|serves assets| Pages[src/pages/]
	Pages --> Components[src/components/]
	Pages --> Layouts[src/layouts/]
	Pages --> Styles[src/styles/]
	Components --> Styles
	Data[src/data/] --> Pages
	classDef folder fill:#f3f4f6,stroke:#111827,stroke-width:1px;
	class Public,Pages,Components,Layouts,Styles,Data folder;
```

> Note: GitHub renders Mermaid diagrams in some views; if your viewer doesn't render them, use the Mermaid Live Editor (https://mermaid.live) to paste the source above.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
