import colors from "tailwindcss/colors";
import { evaluate, ValueType } from "./evaluate";
const { widget } = figma;
const {
  AutoLayout,
  Frame,
  Text,
  useSyncedState,
  usePropertyMenu,
  useEffect,
  useWidgetId,
} = widget;

// function evaluateExpression(scope: Record<string, any>, code: string) {
//   try {
//     const fn = new Function(...Object.keys(scope), `return ${code}`);
//     return fn(...Object.values(scope));
//   } catch (error) {
//     return null;
//   }
// }

// function getInputs(widgetId: string) {
//   const inputs = {};

//   // TODO: clean this up
//   figma.currentPage.children.forEach(node => {
//     if (
//       node.type === "CONNECTOR" &&
//       "endpointNodeId" in node.connectorEnd &&
//       node.connectorEnd.endpointNodeId === widgetId &&
//       "endpointNodeId" in node.connectorStart &&
//       node.text.characters
//     ) {
//       const inputNode = figma.getNodeById(node.connectorStart.endpointNodeId);

//       if (inputNode.type === "WIDGET") {
//         const fn = new Function(`return ${inputNode.widgetSyncedState.value}`);
//         inputs[node.text.characters] = fn();
//       }
//     }
//   });

//   return inputs;
// }

const initialState = {
  code: "1 + 1",
  value: "2",
  type: "number",
} as const;

function App() {
  const widgetId = useWidgetId();
  const [code, setCode] = useSyncedState<string>("code", initialState.code);
  const [value, setValue] = useSyncedState<string>("value", initialState.value);
  const [type, setType] = useSyncedState<ValueType>("type", initialState.type);

  function run(code: string) {
    const result = evaluate(widgetId, code);

    if (result.value) setValue(result.value);
    if (result.type) setType(result.type);
  }

  usePropertyMenu(
    [
      {
        tooltip: "Edit",
        propertyName: "edit",
        itemType: "action",
      },
      {
        tooltip: "Run",
        propertyName: "run",
        itemType: "action",
      },
    ],
    ({ propertyName }) => {
      switch (propertyName) {
        case "edit":
          // TODO: move this into a separate file
          figma.showUI(`
        <pre id="editor" contenteditable=true>${code}</pre>
        <script>
          const editor = document.getElementById("editor");
          editor.addEventListener("input", () => {
            parent.postMessage({ pluginMessage: editor.innerText }, '*');
          })
          editor.focus();
        </script>
      `);
          return new Promise<void>(() => {});

        case "run":
          run(code);
          return;
      }
    }
  );

  useEffect(() => {
    figma.ui.onmessage = message => {
      const code = message;
      setCode(code);
      run(code);

      // const inputs = getInputs(widgetId);
      // const value = evaluateExpression(inputs, code);
      // const type = typeof value;
      // setType(type);
      // switch (type) {
      //   case "function":
      //     setValue(value.toString());
      //     break;

      //   default:
      //     setValue(JSON.stringify(value, null, 2));
      //     break;
      // }
    };
  });

  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      width={400}
      height="hug-contents"
      fill={colors.coolGray[800]}
      cornerRadius={12}
      effect={{
        type: "drop-shadow",
        color: { r: 0, g: 0, b: 0, a: 0.2 },
        offset: { x: 0, y: 0 },
        blur: 2,
        spread: 2,
      }}
    >
      {/* <AutoLayout
        direction="vertical"
        horizontalAlignItems="start"
        verticalAlignItems="start"
        width="fill-parent"
        spacing={8}
        padding={{ vertical: 8, horizontal: 16 }}
        fill={colors.coolGray[900]}
      >
        <Text
          fontFamily="JetBrains Mono"
          fontSize={14}
          fill={colors.coolGray[400]}
        >
          name
        </Text>
      </AutoLayout> */}
      <AutoLayout
        padding={16}
        spacing={4}
        direction="vertical"
        horizontalAlignItems="start"
        verticalAlignItems="start"
        width="fill-parent"
      >
        {code.split("\n").map((line, index) => {
          return line ? (
            <Text
              key={index}
              fontFamily="JetBrains Mono"
              fill={colors.coolGray[200]}
            >
              {line}
            </Text>
          ) : null;
        })}
      </AutoLayout>
      <Frame width="fill-parent" height={1} fill={colors.coolGray[700]} />
      <AutoLayout
        direction="vertical"
        horizontalAlignItems="start"
        verticalAlignItems="start"
        width="fill-parent"
        spacing={8}
        padding={16}
      >
        <Text fontFamily="JetBrains Mono" fill={colors.teal[400]}>
          {value}
        </Text>
        <Text
          fontFamily="JetBrains Mono"
          fontSize={14}
          fill={colors.coolGray[400]}
        >
          {type}
        </Text>
      </AutoLayout>
    </AutoLayout>
  );
}
widget.register(App);
