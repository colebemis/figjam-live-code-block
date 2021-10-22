import colors from "tailwindcss/colors";
import { evaluateWidget, ValueType } from "./evaluate-widget";
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

const initialState = {
  code: "1 + 1",
  value: "2",
  type: "number",
  error: "",
} as const;

function App() {
  const widgetId = useWidgetId();
  const [code, setCode] = useSyncedState<string>("code", initialState.code);
  const [value, setValue] = useSyncedState<string>("value", initialState.value);
  const [type, setType] = useSyncedState<ValueType>("type", initialState.type);
  const [error, setError] = useSyncedState<string>("error", initialState.error);

  function run(code: string) {
    const result = evaluateWidget(widgetId, code);

    setError(result.error);

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

      // TODO: debounce this function call to avoid flashing errors as users type
      run(code);
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
        {error ? (
          <Text fontFamily="JetBrains Mono" fill={colors.red[400]}>
            {error}
          </Text>
        ) : (
          <Text fontFamily="JetBrains Mono" fill={colors.teal[400]}>
            {value}
          </Text>
        )}
        <Text
          fontFamily="JetBrains Mono"
          fontSize={14}
          fill={colors.coolGray[400]}
        >
          {error ? "error" : type}
        </Text>
      </AutoLayout>
    </AutoLayout>
  );
}
widget.register(App);
