# vscode-lesslint

A [Visual Studio Code](https://code.visualstudio.com/) extension to lint **only** [Less](http://lesscss.org/) with [stylelint](https://stylelint.io/)

### Optional (but recommended) setup

To prevent both [the editor built-in linters](https://code.visualstudio.com/docs/languages/css#_syntax-verification-linting) `[less]` and this extension `[lesslint]` from reporting essentially the same errors like in the screenshot, disable the built-in ones in User or Workspace [setting](https://code.visualstudio.com/docs/getstarted/settings):

```json
"less.validate": false
```

## Extension Settings

This extension has no settings!

Just use `.stylelintrc` and `.stylelintignore` under project root directory. See [stylelint configuration file](https://stylelint.io/user-guide/example-config/). 

## Todo

This extension only support `.stylelintignore` under the porject root(ie. `process.cwd()`) now.

In the future it should support loop scanning of ignore files form directory of current open file to the project root.
