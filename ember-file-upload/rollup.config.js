import typescript from 'rollup-plugin-ts';
import { defineConfig } from 'rollup';

import { Addon } from '@embroider/addon-dev/rollup';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});

export default defineConfig({
  output: addon.output(),
  plugins: [
    // These are the modules that users should be able to import from your
    // addon. Anything not listed here may get optimized away.
    addon.publicEntrypoints([
      'components/**/*.ts',
      'helpers/**/*.ts',
      'services/**/*.ts',
      'mirage/index.ts',
      'interfaces.ts',
      'queue.ts',
      'upload-file.ts',
      'test-support.ts',
      'system/upload-file-reader.ts',
      'system/data-transfer-wrapper.ts',
      'system/http-request.ts',
    ]),

    // These are the modules that should get reexported into the traditional
    // "app" tree. Things in here should also be in publicEntrypoints above, but
    // not everything in publicEntrypoints necessarily needs to go here.
    addon.appReexports([
      'components/**/*.js',
      'helpers/**/*.js',
      'services/**/*.js',
    ]),

    typescript({
      transpiler: 'babel',
      browserslist: false,
      transpileOnly: false,
      tsconfig: {
        fileName: 'tsconfig.json',
        hook: (config) => ({
          ...config,
          declaration: true,
          declarationMap: true,
          // See: https://devblogs.microsoft.com/typescript/announcing-typescript-4-5/#beta-delta
          // Allows us to use `exports` to define types per export
          // However, we can't use that feature until the minimum supported TS is 4.7+
          declarationDir: './dist',
        }),
      },
    }),

    // Follow the V2 Addon rules about dependencies. Your code can import from
    // `dependencies` and `peerDependencies` as well as standard Ember-provided
    // package names.
    addon.dependencies(),

    // Ensure that standalone .hbs files are properly integrated as Javascript.
    addon.hbs(),

    // addons are allowed to contain imports of .css files, which we want rollup
    // to leave alone and keep in the published output.
    addon.keepAssets(['**/*.css']),

    addon.clean(),
  ],
});
