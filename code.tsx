const { widget } = figma;
const {
  AutoLayout,
  Text,
  useSyncedState,
  usePropertyMenu,
  useEffect,
  useWidgetId,
} = widget;

function evaluateExpression(scope: Record<string, any>, code: string) {
  try {
    const fn = new Function(...Object.keys(scope), `return ${code}`);
    return fn(...Object.values(scope));
  } catch (error) {
    return null;
  }
}

function getInputs(widgetId: string) {
  const inputs = {};

  // TODO: clean this up
  figma.currentPage.children.forEach(node => {
    if (
      node.type === "CONNECTOR" &&
      "endpointNodeId" in node.connectorEnd &&
      node.connectorEnd.endpointNodeId === widgetId &&
      "endpointNodeId" in node.connectorStart &&
      node.text.characters
    ) {
      const inputNode = figma.getNodeById(node.connectorStart.endpointNodeId);

      if (inputNode.type === "WIDGET") {
        inputs[node.text.characters] = inputNode.widgetSyncedState.value;
      }
    }
  });

  return inputs;
}

function App() {
  const widgetId = useWidgetId();

  const [code, setCode] = useSyncedState("code", "Hello\nWidgets");
  const [value, setValue] = useSyncedState<any>("value", null);

  usePropertyMenu(
    [
      {
        tooltip: "Edit",
        propertyName: "edit",
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
      }
    }
  );

  useEffect(() => {
    figma.ui.onmessage = message => {
      const code = message;
      setCode(code);

      const inputs = getInputs(widgetId);
      const value = evaluateExpression(inputs, code);
      setValue(value);
    };
  });

  return (
    <AutoLayout
      direction="horizontal"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      height="hug-contents"
      padding={8}
      fill="#FFFFFF"
      spacing={12}
      effect={{
        type: "drop-shadow",
        color: { r: 0, g: 0, b: 0, a: 0.2 },
        offset: { x: 0, y: 0 },
        blur: 2,
        spread: 2,
      }}
    >
      <AutoLayout
        direction="vertical"
        horizontalAlignItems="start"
        verticalAlignItems="start"
        width={200}
        spacing={16}
      >
        {code.split("\n").map((line, index) => {
          return line ? (
            <Text
              key={index}
              fontSize={12}
              horizontalAlignText="left"
              width="fill-parent"
              fontFamily="Roboto Mono"
            >
              {line}
            </Text>
          ) : null;
        })}
        <Text fontSize={12}>{JSON.stringify(value, null, 2)}</Text>
      </AutoLayout>
    </AutoLayout>
  );
}
widget.register(App);
