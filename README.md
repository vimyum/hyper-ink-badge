Hyper InkBadge
====

**HyperInkBadge is a badge plugin for [Hyper.app](https://hyper.is/)**.
It shows you a *badge* telling you the current session by ink color. 
Besides the colored ink, it could show text information as badges.
This plugin is inspired by [Badges of iTerm2](https://www.iterm2.com/documentation-badges.html) and [Splatoon](https://splatoon.nintendo.com/)!

![overview](https://user-images.githubusercontent.com/1744970/42226057-ec5f44fc-7f18-11e8-8a7c-861ee3f1a2d0.gif)

## Features & Demo

### Change the color
You can change color of ink via GUI or CLI.
 * GUI: Just click the *badge*.
 * CLI: Input quoted *ink-badge* command with color code like below.
```
$'ink-badge #5FA, #3B3'
```
![chagecolor](https://user-images.githubusercontent.com/1744970/42226058-ec8a56f6-7f18-11e8-978c-f96aca2c3f3e.gif)

 * Click the *badge* with 'command' key then you can use color picker.

![colorpicker](https://user-images.githubusercontent.com/1744970/42232280-e6a7c2ea-7f28-11e8-998e-4bb3a0af271a.gif)

### Set text
* Input quoted *ink-badge* command with text like below.
```bash
$ 'ink-badge Hello World
```

### Fix the color to 'Tab title'
* Click with 'Shift' key then you can fixe current ink color to current *tab title*. 

![fixtotitle](https://user-images.githubusercontent.com/1744970/42232809-97dfee7e-7f2a-11e8-8c1c-5fcf213703a5.gif)

## Install
 * get code from github, and compile it as below.
 
```bash
$ cd ~/.hyper_plugins/local
$ git clone
$ yarn
$ yarn webpack
```
 * Configure the `localPlugins` parameter in `~/.hyper.js` as bellow.
 
```
   localPlugins: ["hyper-ink-badge"],
```

## Configuration.

```js
module.exports = {
  config: {
    hyperInktoon: {
        command: 'ink',
        templateColors: [
            ['#e78a48', '#ffffff'], 
            ['#d9503f', '#5186ec'],
            ['#3472b4', '#4aabb8'],
        ],
        advancedPicker: true,
        fontPath: 'file:///tmp/ikamodoki.woff',
        imagePath: '/tmp/slime.svg',
        baseColors: ['#0096d9', '#e5004a'],
    },
  }
}
```

### command
* change cli command key. default is value is `ink-badge`.

### templateColors
* Specify the template colors that used to change color by clicking the *badge*.

### advancedPicker
* Set true, you can use color picker that enables you to select more detailed color. default *false*.

<img width="576" alt="deteiedcolorpicker" src="https://user-images.githubusercontent.com/1744970/42233721-455b986c-7f2d-11e8-9fbf-50fb2dd1c9a4.png">


## Licence

[MIT](./LICENSE.txt)
