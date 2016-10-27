'use strict';
/* eslint-env node */

const Merge = require('broccoli-merge-trees');
const Sass = require('broccoli-sass-source-maps');
const LiveReload = require('broccoli-inject-livereload');
const Autoprefixer = require('broccoli-autoprefixer');
const CssOptimizer = require('broccoli-csso');
const Funnel = require('broccoli-funnel');
const Babel = require('broccoli-babel-transpiler');
const mv = require('broccoli-stew').mv;
const rm = require('broccoli-stew').rm;
const browserify = require('broccoli-browserify-cache');
const globify = require('require-globify');

let pubFiles = new LiveReload('public');

if (process.env.EMBER_ENV === 'production') {
  pubFiles = 'public';
}

const stylePaths = [
  'app/styles',
  'node_modules',
];
const appNoSass = rm('app', '**/*.scss');

const babelScript = new Babel(appNoSass);

const appScript = browserify(babelScript, {
  entries: ['./index'],
  outputFile: 'app.js',

  config(brow) {
    const cucumberify = require('./cucumberify');

    brow.transform(cucumberify);
    // brow.transform(globify);
  },
});

const compiledSass = new Sass(stylePaths, 'app.scss', 'app.css', {});
const optimizedCSS = new CssOptimizer(compiledSass);
const styles = new Autoprefixer(optimizedCSS);

if (process.env.EMBER_ENV === 'test') {
  const testTree = new Merge([
    mv(babelScript, 'app'),
    mv(new Babel('tests'), 'tests'),
  ]);

  const testJs = browserify(testTree, {
    entries: ['./tests/index-test'],
    outputFile: 'tests.js',
    config(brow) {
      const cucumberify = require('./cucumberify');

      brow.transform(cucumberify);
      // brow.transform(globify);
    },
  });

  module.exports = new Merge([pubFiles, styles, appScript, testJs]);
} else {
  module.exports = new Merge([pubFiles, styles, appScript]);
}
