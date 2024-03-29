# backtrack

[![npm](https://img.shields.io/npm/v/@backtrack/core.svg?label=npm%20version)](https://www.npmjs.com/package/@backtrack/core)

[//]: # '[![Code Coverage](https://img.shields.io/codecov/c/github/chrisblossom/backtrack/master.svg)](https://codecov.io/gh/chrisblossom/backtrack/branch/master)'

## About

`backtrack` is a task runner / file manager used to create repeatable configurations. Setup tools such as [`babel`](https://babeljs.io/), [`eslint`](https://eslint.org/), [`prettier`](https://prettier.io/), or your build process once and never think about it again. Can be used to create a sharable app such as [`create-react-app`](https://github.com/facebook/create-react-app).

Can be used for:

-   Task runner expressed in plain JS
-   File / config / package.json manager
-   Extendable configuration

## Installation

`npm install --save-dev @backtrack/core`

## Usage

```js
// .backtrackrc.js
'use strict';

module.exports = {
	// backtrack config
};
```

See [docs](./docs/)

## Presets

-   [@backtrack/preset-node](https://github.com/chrisblossom/backtrack-preset-node)
-   [@backtrack/preset-preset](https://github.com/chrisblossom/backtrack-preset-preset)
-   [@backtrack/preset-jest](https://github.com/chrisblossom/backtrack-preset-jest)
-   [@backtrack/preset-style](https://github.com/chrisblossom/backtrack-preset-style)

[Discover more `backtrack` presets](https://www.npmjs.com/search?q=backtrack-preset)
