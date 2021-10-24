# FigJam Live Code Block Widget

Turn FigJam into a collaborative JavaScript canvas

![cover](/assets/cover.png)

Could be used for:

- Code review
- Teaching
- Debugging
- Pair programming
- Technical interviews
- ???

## Installation

_Coming soon to the Figma Community_

## Usage

_TODO_

- insert
- change expression\* (notice output changes as you edit)

![CleanShot 2021-10-24 at 12 13 45](https://user-images.githubusercontent.com/4608155/138609195-af4849e4-e6f8-4a3d-bb50-99113962af80.gif)



- run the code when the editor is closed using the run action
- use the output of one block as an input to another block using connectors
- autocomplete inputs in editor
- create a new block that references that output value of the current block

### Global variables

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
