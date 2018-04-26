# Config Manager

`configManager` is used to extend managed files. See also: [configuration/config.md](./configuration/config.md).

```js
// .eslintrc.js example

'use strict';

const Backtrack = require('@backtrack/core');

const { configManager, pkg } = new Backtrack();

const eslint = {
    // Use pkg.resolve to correctly resolve airbnb-base
    // from @backtrack/preset-style's dependencies
    extends: [pkg.resolve('@backtrack/preset-style', 'airbnb-base')],
};

module.exports = configManager({
    namespace: '@backtrack/preset-style',
    config: eslint,
});
```


## options:

**config**: target config

**namespace**: Unique identifier to manage config
