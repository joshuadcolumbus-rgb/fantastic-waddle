# ContextCut

A token-optimization CLI for AI coding agents. Crawls a JS/TS repository, strips comments and blank lines from every source file via the TypeScript AST printer, and writes the pruned code into a single Markdown manifest with a token-savings report.

## Usage

```bash
npm install
npm start                                  # current dir → ./context.md
npm start -- -d /path/to/repo -o out.md    # explicit target and output
```

Or install it as a global command:

```bash
npm run build && npm link
contextcut --dir /path/to/repo --out context.md
```

| Flag | Default | Description |
| --- | --- | --- |
| `-d, --dir <path>` | cwd | Target directory to parse |
| `-o, --out <filename>` | `context.md` | Output manifest file (resolved against cwd) |
| `-m, --mode <mode>` | from config | `skeleton` collapses every function body to `{ /* pruned */ }`, keeping signatures, types, and module structure only; `full-text` keeps bodies and only strips comments/blank lines |
| `-p, --prune-bodies` | — | Alias for `--mode skeleton` |
| `-k, --key <token>` | `CONTEXTCUT_LICENSE` env | Premium team license key: verify against the Edge API and sync the team's remote config |

## Configuration

Drop a `.contextcutrc` (JSON) in the target directory:

```json
{
  "mode": "full-text",
  "ignoreDirs": ["fixtures", "generated"]
}
```

- `mode` — `skeleton` (default) or `full-text`. CLI `--mode` wins over the config file.
- `ignoreDirs` — extra directory names to skip, merged with the built-in ignore list (`node_modules`, `.git`, `dist`, `build`, `.next`, `coverage`, `out`).

A missing config file is fine (defaults apply); a malformed one prints a warning and falls back to defaults rather than being silently ignored.

### Remote team config

With `-k, --key <token>` (or `CONTEXTCUT_LICENSE`), the CLI verifies the license against the Edge API (`CONTEXTCUT_API_URL`, defaulting to the deployed worker URL) and pulls the team's shared config. Full precedence:

**CLI flags > remote team config > local `.contextcutrc` > built-in defaults**

When a key is provided, *any* sync failure — rejected key or unreachable API — aborts the run (exit 1). This is deliberate: a team's remote config may carry ignore rules that keep sensitive directories out of manifests, so the CLI refuses to fall back to weaker local rules once team sync was requested. Run without the key to work offline with local config.

## Packaging standalone binaries

```bash
npm run bundle    # esbuild → dist/contextcut.cjs (single-file CJS, deps inlined)
npm run package   # bundle + pkg → dist/binaries/ for linux-x64, macos-x64, macos-arm64, win-x64
```

Binaries are built with [@yao-pkg/pkg](https://github.com/yao-pkg/pkg) (the maintained fork of the archived `vercel/pkg`) against Node 22. Each binary embeds the Node runtime (58–81 MB) and needs no local Node install. The esbuild pre-bundle is what makes this work: pkg cannot snapshot ESM, so the ESM source is first flattened to one CJS file.

Output names: `contextcut-linux-x64`, `contextcut-macos-x64`, `contextcut-macos-arm64`, `contextcut-win-x64.exe`.

CI: pushes to `main` touching `contextcut/` (or a manual dispatch) run `.github/workflows/contextcut-binaries.yml` at the repo root, which packages all four targets and uploads each as a workflow artifact.

macOS caveat: binaries cross-built on Linux are unsigned; Apple Silicon requires at least an ad-hoc signature, so after downloading run `codesign --sign - contextcut-macos-arm64` on a Mac (Gatekeeper will otherwise kill the process).

## Edge API (worker/)

A Cloudflare Worker (`worker/`) provides the hosted side: license verification and team config sync, backed by a KV namespace bound as `CONTEXTCUT_DB`.

- `POST /api/verify` — validates the `Authorization: Bearer <licenseKey>` and returns `{ active, team }`.
- `GET /api/config/<teamId>` — returns the team's remote `.contextcutrc`; the bearer license must belong to that team. `404` means "no remote config, use local defaults".
- `PUT /api/config/<teamId>` — writes the team's remote config (used by the Dashboard); same ownership check as the read path, plus shape validation on `mode`/`ignoreDirs`.
- `POST /api/webhooks/stripe` — Stripe webhook (signature-verified via Web Crypto). On `checkout.session.completed` it mints a `cc_key_*` license, using the Stripe customer id as the team id, and seeds a default team config. Replayed events are deduped per checkout session, so Stripe retries never mint duplicate keys.

KV schema: `license_<key>` → team JSON (`{ "id": "<teamId>", ... }`); `config_<teamId>` → config JSON; `stripe_session_<id>` → minted key (idempotency marker).

Secrets: `wrangler secret put STRIPE_API_KEY` and `wrangler secret put STRIPE_WEBHOOK_SECRET` (locally: `worker/.dev.vars`, gitignored).

```bash
cd worker
npm install
npm run check     # typecheck against workers-types
npm run dev       # local dev on miniflare (seed data: wrangler kv key put --binding CONTEXTCUT_DB --local ...)
npm run deploy    # needs a real KV namespace id in wrangler.toml
```

## Dashboard (dashboard/)

A Vite + React + Tailwind app (`dashboard/`) for teams to manage their remote config without touching the CLI. Enter a `cc_key_*` license to authenticate against `/api/verify`, then edit engine mode and ignore directories and save via `PUT /api/config/<teamId>`.

```bash
cd dashboard
npm install
npm run dev     # http://localhost:5173, points at http://localhost:8787 by default
npm run build   # dist/ static bundle — deploy anywhere (Pages, the worker's assets, etc.)
```

Point it at a non-default worker with `VITE_API_BASE_URL` (see `.env.example`).

## V1 policy

- Comments removed via `ts.createPrinter({ removeComments: true })` — the code stays structurally intact (JSX included, even in `.js` files).
- Blank lines collapsed with a regex post-pass.
- With `--prune-bodies`, an AST transformer additionally collapses function bodies (declarations, methods, constructors, accessors, function expressions, block-bodied arrows) to `{ /* pruned */ }`. Implicit-return arrows are kept — they are already terse and often carry the only meaningful logic.
- Files with parse errors are kept as raw source (printing a broken AST silently corrupts code).
- Skipped: `node_modules`, `.git`, `dist`, `build`, `.next`, `coverage`, `out`, hidden entries, `*.min.js`, `*.d.ts`.

## Known limitations

- The printer re-indents output with 4 spaces, so 2-space codebases recover slightly less than the comment stripping alone would suggest. Trimming leading indentation entirely is a candidate V2 policy.
- Token estimate is the rough ~4 chars/token heuristic, not a real tokenizer.
