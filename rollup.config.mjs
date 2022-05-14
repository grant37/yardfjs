import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import fs from 'fs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { readPackageUpSync } from 'read-pkg-up';
import resolve from '@rollup/plugin-node-resolve';

const excludePath = 'node_modules/**';
const extensions = ['.js', '.ts'];

const { packageJson: pkg } = readPackageUpSync({
  cwd: fs.realpathSync(process.cwd()),
});

const fileInput = process.env.INPUT_FILE;

export default [
  buildJS(fileInput, pkg.main, 'cjs'),
  buildJS(fileInput, 'dist/esm', 'es'),
];

// Adapted from https://github.com/SoYoung210/lerna-rollup-github-package-example/blob/master/rollup.config.js
function buildJS(input, output, format) {
  const defaultOutputConfig = {
    format,
    exports: 'named',
    sourcemap: true,
  };

  const esOutputConfig = {
    ...defaultOutputConfig,
    dir: output,
  };
  const cjsOutputConfig = {
    ...defaultOutputConfig,
    file: output,
  };

  const config = {
    input,
    output: [format === 'es' ? esOutputConfig : cjsOutputConfig],
    plugins: [
      peerDepsExternal(),
      commonjs(),
      resolve({
        preferBuiltins: false,
        extensions,
      }),
      babel({
        presets: ['@babel/env', '@babel/preset-typescript'],
        plugins: ['@babel/plugin-transform-runtime'],
        babelHelpers: 'runtime',
        exclude: excludePath,
        extensions,
      }),
    ],
    preserveModules: format === 'es',
  };

  return config;
}
