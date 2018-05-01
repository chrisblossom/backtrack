# Presets

`presets` are used to include shared `backtrack` configurations. Presets are designed to make it easy to separate parts of your application as much as you want. For example, one preset could be for `webpack` and another for `eslint`.

```js
const backtrackConfig = {
    presets: ['@backtrack/preset-style'],
    // ...
};
```
