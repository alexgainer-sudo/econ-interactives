# econ-interactives

Client-side ECON 101 web interactives, deployed via Cloudflare Pages and linked/embedded
from Canvas. Each subfolder is one self-contained interactive: a single `index.html` with
no build step, no backend, and no API keys or secrets.

**This is a deploy-only mirror.** The actual editing/source-of-truth workflow happens
elsewhere (with Claude Code); a finished interactive gets copied into this repo and pushed
only when it's ready to go live. Don't hand-edit files here directly — edits made here won't
flow back to the source.

## Adding a new interactive

A new interactive should be a **static, client-side-only web app**: no backend, no API keys
or secrets, no student data storage, works on desktop/tablet/mobile, and renders correctly
opened directly from the filesystem (no build step) unless there's a specific reason it
needs one. Put it in its own subfolder here, matching the shape of `supply-demand/`.

For each new subfolder, create a matching Cloudflare Pages project (Workers & Pages ->
Create -> Pages -> Connect to Git -> this repo), with:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | `None` |
| Build command | *(leave blank)* |
| Root directory | the subfolder's name |
| Build output directory | `/` |

## Contents

- `supply-demand/index.html` — draggable linear demand/supply curves, live equilibrium
  price/quantity, optional consumer/producer surplus shading. Built and verified 2026-09-06.
- `supply-demand-lab/index.html`: guided prediction, exploration and transfer activity on
  movements along demand versus demand shifts and simultaneous market changes. Built and
  verified 2026-09-08.
