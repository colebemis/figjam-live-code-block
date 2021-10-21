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

  const [code, setCode] = useSyncedState("code", "1 + 1");
  const [value, setValue] = useSyncedState<any>("value", 2);

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
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      width={400}
      height="hug-contents"
      fill="#1E293B"
      cornerRadius={12}
      effect={{
        type: "drop-shadow",
        color: { r: 0, g: 0, b: 0, a: 0.2 },
        offset: { x: 0, y: 0 },
        blur: 2,
        spread: 2,
      }}
    >
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
            <Text key={index} fontFamily="Source Code Pro" fill="#E2E8F0">
              {line}
            </Text>
          ) : null;
        })}
      </AutoLayout>
      <Frame width="fill-parent" height={1} fill="#334155" />
      <AutoLayout
        direction="vertical"
        horizontalAlignItems="start"
        verticalAlignItems="start"
        width="fill-parent"
        padding={16}
      >
        <Text fontFamily="Source Code Pro" fill="#E2E8F0">
          {JSON.stringify(value, null, 2)}
        </Text>
      </AutoLayout>
    </AutoLayout>
  );
}
widget.register(App);
