import { promises as fs } from 'fs';
import * as path from 'path';
import ts from 'typescript';
import type { ContextCutConfig } from './config.js';

// --- Configuration ---
export const BASE_IGNORE_DIRS: ReadonlySet<string> = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'out',
]);
const ALLOWED_EXTENSIONS = new Set(['.ts', '.js', '.tsx', '.jsx', '.mts', '.cts', '.mjs', '.cjs']);
// Generated/minified files are huge, low-value token sinks
const IGNORE_FILE_PATTERNS = [/\.min\.js$/, /\.d\.ts$/, /\.d\.mts$/, /\.d\.cts$/];

/**
 * Recursively crawls a directory, returning a flattened array of valid file paths.
 * Bypasses ignored directories to maintain speed and prevent memory bloat.
 * Symlinked directories are not followed (Dirent.isDirectory() is false for them),
 * which doubles as cycle protection.
 */
export async function crawlRepository(dir: string, config: ContextCutConfig): Promise<string[]> {
  // Merge default ignores with user-defined ignores once, then recurse on the set
  const activeIgnores = new Set([...BASE_IGNORE_DIRS, ...(config.ignoreDirs ?? [])]);
  return walk(dir, activeIgnores);
}

async function walk(dir: string, ignoreDirs: ReadonlySet<string>): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    // Skip hidden files and blacklisted directories
    if (ignoreDirs.has(entry.name) || entry.name.startsWith('.')) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath, ignoreDirs)));
    } else if (
      ALLOWED_EXTENSIONS.has(path.extname(entry.name)) &&
      !IGNORE_FILE_PATTERNS.some((p) => p.test(entry.name))
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

export interface PruneResult {
  code: string;
  /** True when the file failed to parse and the raw source was returned untouched. */
  usedFallback: boolean;
}

/**
 * Creates an AST Transformer that collapses function bodies into empty blocks
 * marked with a "pruned" comment. Covers declarations, methods, constructors,
 * accessors, function expressions, and block-bodied arrows (implicit returns
 * are left alone — they are already terse).
 */
function createPruneTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context) => {
    const { factory } = context;
    return (rootNode) => {
      // ts.addSyntheticInnerComment is not public API; a NotEmittedStatement carrying a
      // synthetic leading comment prints as just the comment inside the empty block.
      // The original node must be freshly synthesized (pos -1) or its source comments leak.
      const createPrunedBlock = () => {
        const marker = factory.createNotEmittedStatement(factory.createEmptyStatement());
        ts.addSyntheticLeadingComment(marker, ts.SyntaxKind.MultiLineCommentTrivia, ' pruned ', false);
        return factory.createBlock([marker]);
      };

      function visit(node: ts.Node): ts.Node {
        // 1. Standard Functions
        if (ts.isFunctionDeclaration(node) && node.body) {
          return factory.updateFunctionDeclaration(
            node,
            node.modifiers,
            node.asteriskToken,
            node.name,
            node.typeParameters,
            node.parameters,
            node.type,
            createPrunedBlock()
          );
        }

        // 2. Class Methods
        if (ts.isMethodDeclaration(node) && node.body) {
          return factory.updateMethodDeclaration(
            node,
            node.modifiers,
            node.asteriskToken,
            node.name,
            node.questionToken,
            node.typeParameters,
            node.parameters,
            node.type,
            createPrunedBlock()
          );
        }

        // 3. Constructors
        if (ts.isConstructorDeclaration(node) && node.body) {
          return factory.updateConstructorDeclaration(node, node.modifiers, node.parameters, createPrunedBlock());
        }

        // 4. Accessors
        if (ts.isGetAccessorDeclaration(node) && node.body) {
          return factory.updateGetAccessorDeclaration(
            node,
            node.modifiers,
            node.name,
            node.parameters,
            node.type,
            createPrunedBlock()
          );
        }
        if (ts.isSetAccessorDeclaration(node) && node.body) {
          return factory.updateSetAccessorDeclaration(node, node.modifiers, node.name, node.parameters, createPrunedBlock());
        }

        // 5. Function Expressions
        if (ts.isFunctionExpression(node) && node.body) {
          return factory.updateFunctionExpression(
            node,
            node.modifiers,
            node.asteriskToken,
            node.name,
            node.typeParameters,
            node.parameters,
            node.type,
            createPrunedBlock()
          );
        }

        // 6. Arrow Functions (only if they have block bodies, not implicit returns)
        if (ts.isArrowFunction(node) && ts.isBlock(node.body)) {
          return factory.updateArrowFunction(
            node,
            node.modifiers,
            node.typeParameters,
            node.parameters,
            node.type,
            node.equalsGreaterThanToken,
            createPrunedBlock()
          );
        }

        // Continue traversing the tree for nested functions
        return ts.visitEachChild(node, visit, context);
      }
      return ts.visitNode(rootNode, visit) as ts.SourceFile;
    };
  };
}

/**
 * Parses source code into an AST and reprints it with a strict token-reduction policy.
 * full-text mode: strip all comments and collapse whitespace.
 * skeleton mode: additionally collapse function bodies to signature skeletons.
 */
export function pruneCode(sourceCode: string, fileName: string, config: ContextCutConfig): PruneResult {
  // 1. Generate the Abstract Syntax Tree
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceCode,
    ts.ScriptTarget.Latest,
    true // setParentNodes
  );

  // 2. Bail out on parse errors — printing a broken AST silently corrupts code.
  // parseDiagnostics is a runtime property not exposed in the public type defs.
  const parseErrors = (sourceFile as unknown as { parseDiagnostics: unknown[] }).parseDiagnostics;
  if (parseErrors.length > 0) {
    return { code: sourceCode, usedFallback: true };
  }

  // 3. Configure the AST Printer to drop comments
  const printer = ts.createPrinter({
    removeComments: true,
    newLine: ts.NewLineKind.LineFeed,
  });

  // 4. Reprint the structurally intact, comment-free code
  let prunedCode = printer.printFile(sourceFile);

  // 5. Skeleton mode: second pass to collapse function bodies. The comment-free
  // output is reparsed so a marker-preserving print (removeComments: false) can
  // emit the synthetic "pruned" comments without resurrecting any original
  // comments — removeComments: true would strip synthetic comments along with
  // real ones, and regex stripping corrupts string literals containing // or /*.
  if (config.mode === 'skeleton') {
    const strippedFile = ts.createSourceFile(fileName, prunedCode, ts.ScriptTarget.Latest, true);
    const result = ts.transform(strippedFile, [createPruneTransformer()]);
    const markerPrinter = ts.createPrinter({ removeComments: false, newLine: ts.NewLineKind.LineFeed });
    prunedCode = markerPrinter.printFile(result.transformed[0]);
    result.dispose();
  }

  // 6. Regex cleanup pass to eliminate structural gaps left by the AST printer
  prunedCode = prunedCode.replace(/\n\s*\n/g, '\n');

  return { code: prunedCode, usedFallback: false };
}
