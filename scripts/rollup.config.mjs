import commonjs from '@rollup/plugin-commonjs';
import externals from 'rollup-plugin-node-externals';
import swc from 'ts-swc-rollup-plugin';

import path from 'path';
import url from 'url';
const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));

import getTS from 'get-tsconfig-compat';
const tsconfig = getTS.getTsconfig(path.resolve(__dirname, '..', 'tsconfig.json'));
tsconfig.config.compilerOptions.target = 'ES4';

export default {
  output: {
    format: 'umd',
    name: 'tsdsBuild',
  },
  plugins: [commonjs({ extensions: '.cts' }), externals({ deps: false, devDeps: false, builtinsPrefix: 'strip' }), swc({ tsconfig })],
};
