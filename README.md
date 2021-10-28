# FigJam Live Code Block Widget

Turn FigJam into a collaborative JavaScript canvas

![demo](assets/demo.gif)

Could be used for:

- Exploring APIs
- Teaching
- Debugging
- Pair programming
- Code review
- Technical interviews
- ???

Found a creative use for this widget? Let me about it on Twitter ([@colebemis](https://twitter.com/colebemis))

## Installation

_Coming soon to the Figma Community_

## Global variables

Every live code block has access to the following variables:

| Name                   | Type       | Description                                                                                         |
| ---------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| `fetch()`              | `function` | [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/fetch)                                  |
| `fetchJson()`          | `function` |                                                                                                     |
| ~~`Math`~~ _Planned_   | `object`   | [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)   |
| ~~`Array`~~ _Planned_  | `object`   | [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)  |
| ~~`Object`~~ _Planned_ | `object`   | [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) |

## Local development

1. Clone the repository

   ```shell
   git clone https://github.com/colebemis/figjam-javascript-repl.git
   cd figjam-javascript-repl
   ```

1. Install the dependencies

   ```shell
   yarn
   ```

1. Run local development scripts

   ```shell
   yarn start
   ```

1. Open the [Figma desktop app](https://www.figma.com/downloads/)

1. Inside a FigJam file, go to `Menu > Widgets > Development > Import widget from manifest...`

1. Select `/path/to/figjam-javascript-repl/manifest.json`

1. Add the widget to the canvas by selecting `Menu > Widgets > Developement > JavaScript REPL` or search for `JavaScript REPL` in the quick actions bar (`⌘ /`)

## Prior art

- [natto.dev](https://natto.dev/) by [@\_paulshen](https://twitter.com/_paulshen)
