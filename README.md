![](https://badgen.net/badge/SoS正/0.7.0/f2a) ![](https://badgen.net/badge/editor.js/v2.1.8/blue) ![](https://badgen.net/badge/plugin/v1.0.0/orange) 

# Block Plugin to get position of blocks in editor.js and sample of integration with Position Panel in SoSIE

## Feature(s)

### Block init helper

-Provides Block.init() that allow to get position of current selected and go to a block by its position.
Requires both editorjs-undo with Big Brother feature and [Undo Plugin initialization Plugin](https://github.com/sosie-js/undo-plugin)

 
## Integration

Add a line in  either your example.html, after the script-loader line in the loadPlugins section

```javascript
/**
* Plugins
*/
    await loadPlugins([
    {'sosie-js/script-loader@3.0.0': '[example/plugins/script-loader](https://github.com/sosie-js/script-loader)'}, //virtual , already loaded we keep a version trace here
    {'sosie-js/block-plugin@1.0.0': ['[example/plugins/view-plugin](https://github.com/sosie-js/view-plugin)',['dist/bundle.js','dist/sample.js']]}
],nocache,mode,target);
```

## Building the plugin

To produce the dist/bundle.js for production use the command: 

```shell
yarn build
```

## Missing something?

[A demo please SoSie](http://sosie.sos-productions.com/)
