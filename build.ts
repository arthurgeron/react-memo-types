import { isolatedDeclaration } from 'oxc-transform';
import { glob } from 'glob'; // Need glob to find source files
import path from 'node:path'; // Need path for manipulation

console.log('Starting Bun build and d.ts generation...');

const srcDir = 'src';
const outDir = 'dist';
const srcRoot = path.resolve(srcDir);
const outRoot = path.resolve(outDir);

// Step 1: Run Bun.build to compile JS/TS
console.log(`Running Bun.build for entrypoints in ${srcDir} to ${outDir}...`);
const buildResult = await Bun.build({
  entrypoints: [path.join(srcDir, 'index.ts')],
  root: srcDir,
  outdir: outDir,
  target: 'browser', 
  format: 'esm',
  sourcemap: 'external', // Optional: Generate sourcemaps
  // Add splitting: true if needed, ensure format is esm or cjs
  // splitting: true,
});

if (!buildResult.success) {
  console.error("Bun build failed!");
  for (const log of buildResult.logs) {
    console.error(log);
  }
  process.exit(1);
} else {
  console.log("Bun build successful!");
  console.log("Output files:", buildResult.outputs.map(o => o.path));
}

// Step 2: Generate .d.ts files using oxc-transform
console.log(`Generating .d.ts files from ${srcDir} to ${outDir}...`);
const sourceFiles = await glob(`${srcDir}/**/*.ts`); // Find all .ts files in src

if (sourceFiles.length === 0) {
  console.warn("No .ts files found in src directory.");
}

let dtsErrors = 0;
for (const sourceFile of sourceFiles) {
  const absoluteSourcePath = path.resolve(sourceFile);
  console.log(`Processing ${absoluteSourcePath}...`);
  try {
    const fileContent = await Bun.file(absoluteSourcePath).text();
    // Generate declaration - oxc needs the file path and content
    const { code: declarationCode } = isolatedDeclaration(absoluteSourcePath, fileContent);

    // Determine output path
    const relativePath = path.relative(srcRoot, absoluteSourcePath);
    const outPath = path.join(outRoot, relativePath).replace(/\.ts$/, '.d.ts');

    // Ensure directory exists
    const outFileDir = path.dirname(outPath);
    await Bun.$`mkdir -p ${outFileDir}`;

    console.log(`  Writing declaration to: ${outPath}`);
    await Bun.write(outPath, declarationCode);

  } catch (error) {
    console.error(`  Error processing ${absoluteSourcePath}:`, error);
    dtsErrors++;
  }
}

// Also copy over any existing .d.ts files (like our index.d.ts)
console.log(`Copying existing .d.ts files from ${srcDir} to ${outDir}...`);
const declarationFiles = await glob(`${srcDir}/**/*.d.ts`);
for (const declarationFile of declarationFiles) {
    const absoluteSourcePath = path.resolve(declarationFile);
    const relativePath = path.relative(srcRoot, absoluteSourcePath);
    const outPath = path.join(outRoot, relativePath);
    const outFileDir = path.dirname(outPath);
    try {
        await Bun.$`mkdir -p ${outFileDir}`;
        await Bun.$`cp ${absoluteSourcePath} ${outPath}`;
        console.log(`  Copied ${absoluteSourcePath} to ${outPath}`);
    } catch (error) {
        console.error(`  Error copying ${absoluteSourcePath} to ${outPath}:`, error);
        dtsErrors++;
    }
}

if (dtsErrors > 0) {
  console.error(`${dtsErrors} error(s) occurred during d.ts generation/copying.`);
  process.exit(1);
} else {
  console.log("d.ts generation and copying complete.");
} 