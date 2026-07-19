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

## Packaging standalone binaries

```bash
npm run bundle    # esbuild → dist/contextcut.cjs (single-file CJS, deps inlined)
npm run package   # bundle + pkg → dist/binaries/ for linux-x64, macos-x64, macos-arm64, win-x64
```

Binaries are built with [@yao-pkg/pkg](https://github.com/yao-pkg/pkg) (the maintained fork of the archived `vercel/pkg`) against Node 22. Each binary embeds the Node runtime (58–81 MB) and needs no local Node install. The esbuild pre-bundle is what makes this work: pkg cannot snapshot ESM, so the ESM source is first flattened to one CJS file.

Output names: `contextcut-linux-x64`, `contextcut-macos-x64`, `contextcut-macos-arm64`, `contextcut-win-x64.exe`.

CI: pushes to `main` touching `contextcut/` (or a manual dispatch) run `.github/workflows/contextcut-binaries.yml` at the repo root, which packages all four targets and uploads each as a workflow artifact.

macOS caveat: binaries cross-built on Linux are unsigned; Apple Silicon requires at least an ad-hoc signature, so after downloading run `codesign --sign - contextcut-macos-arm64` on a Mac (Gatekeeper will otherwise kill the process).

## V1 policy

- Comments removed via `ts.createPrinter({ removeComments: true })` — the code stays structurally intact (JSX included, even in `.js` files).
- Blank lines collapsed with a regex post-pass.
- With `--prune-bodies`, an AST transformer additionally collapses function bodies (declarations, methods, constructors, accessors, function expressions, block-bodied arrows) to `{ /* pruned */ }`. Implicit-return arrows are kept — they are already terse and often carry the only meaningful logic.
- Files with parse errors are kept as raw source (printing a broken AST silently corrupts code).
- Skipped: `node_modules`, `.git`, `dist`, `build`, `.next`, `coverage`, `out`, hidden entries, `*.min.js`, `*.d.ts`.

## Known limitations

- The printer re-indents output with 4 spaces, so 2-space codebases recover slightly less than the comment stripping alone would suggest. Trimming leading indentation entirely is a candidate V2 policy.
- Token estimate is the rough ~4 chars/token heuristic, not a real tokenizer.
