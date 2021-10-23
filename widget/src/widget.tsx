import colors from "tailwindcss/colors";
import { ValueType, EditorMessage, WidgetMessage } from "../../types";
const { widget } = figma;
const {
  AutoLayout,
  Frame,
  Text,
  useSyncedState,
  usePropertyMenu,
  useEffect,
  useWidgetId,
  waitForTask,
} = widget;

// TODO: Replace https://vscode.dev with production editor URL
const editorUrl =
  process.env.NODE_ENV === "production"
    ? "https://vscode.dev"
    : "http://localhost:3000";

const editorUI = `<script>window.location.href = '${editorUrl}'</script>`;

const initialState = {
  code: "1 + 1",
  value: "2",
  valueType: "number",
  error: "",
  isExpanded: false,
} as const;

function Widget() {
  const widgetId = useWidgetId();

  // Initialize state
  const [code, setCode] = useSyncedState<string>("code", initialState.code);
  const [value, setValue] = useSyncedState<string>("value", initialState.value);
  const [valueType, setValueType] = useSyncedState<ValueType>(
    "valueType",
    initialState.valueType
  );
  const [error, setError] = useSyncedState<string>("error", initialState.error);
  const [isExpanded, setIsExpanded] = useSyncedState<boolean>(
    "isExpanded",
    initialState.isExpanded
  );

  // The `editor` UI (src/editor.html) must be running when the `run` function
  // is called because we evaluate code in the UI environment.
  // This enables us to evaluate code with network requests.
  // Reference: https://www.figma.com/widget-docs/making-network-requests/
  function run(code: string) {
    return new Promise(resolve => {
      const inputs = getInputs(widgetId);

      // Send code to the UI to evaluate
      postMessage({ type: "evaluate", code, inputs });

      // Wait for the UI to send back evaluated code
      figma.ui.on("message", handleMessage);

      function handleMessage(message: WidgetMessage) {
        if (message.type === "codeEvaluated") {
          const { value, valueType, error } = message;

          // Update state
          setError(error);
          if (value) setValue(value);
          if (valueType) setValueType(valueType);

          // Clean up
          figma.ui.off("message", handleMessage);

          resolve(null);
        }
      }
    });
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
          figma.showUI(editorUI, { width: 500, height: 300 });
          const inputs = getInputs(widgetId);
          postMessage({ type: "initialize", code, inputs });

          // Keep UI open
          return new Promise<void>(() => {});

        case "run":
          figma.showUI(editorUI, { visible: false });
          waitForTask(run(code));
          return;
      }
    }
  );

  useEffect(() => {
    figma.ui.onmessage = (message: WidgetMessage) => {
      switch (message.type) {
        case "codeChanged":
          const { code } = message;
          setCode(code);

          // TODO: debounce this function call to avoid flashing errors as users type
          run(code);
          break;
      }
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
          <AutoLayout
            direction="vertical"
            horizontalAlignItems="start"
            verticalAlignItems="start"
            width="fill-parent"
            spacing={8}
          >
            {value.split("\n").length > 10 ? (
              <Text
                fontFamily="JetBrains Mono"
                fontSize={14}
                fill={colors.teal[400]}
                textDecoration="underline"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Show less" : "Show more"}
              </Text>
            ) : null}
            <AutoLayout
              spacing={4}
              direction="vertical"
              horizontalAlignItems="start"
              verticalAlignItems="start"
              width="fill-parent"
            >
              {value
                .split("\n")
                .filter((_, index) => isExpanded || index < 10)
                .map((line, index) => {
                  return line ? (
                    <Text
                      key={index}
                      fontFamily="JetBrains Mono"
                      fill={colors.teal[400]}
                    >
                      {line}
                    </Text>
                  ) : null;
                })}
              {!isExpanded && value.split("\n").length > 10 ? (
                <Text
                  fontFamily="JetBrains Mono"
                  fill={colors.teal[400]}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  ...
                </Text>
              ) : null}
            </AutoLayout>
          </AutoLayout>
        )}
        <Text
          fontFamily="JetBrains Mono"
          fontSize={14}
          fill={colors.coolGray[400]}
        >
          {error ? "error" : valueType}
        </Text>
      </AutoLayout>
    </AutoLayout>
  );
}

function postMessage(message: EditorMessage) {
  figma.ui.postMessage(message);
}

function getInputs(widgetId: string) {
  const inputs: Record<string, string> = {};

  // Search all nodes in the document
  for (const node of figma.currentPage.children) {
    // Ignore nodes that aren't connectors
    if (node.type !== "CONNECTOR") continue;

    // Ignore connectors that don't end at a node
    if (!("endpointNodeId" in node.connectorEnd)) continue;

    // Ignore connectors that don'e end at the current widget
    if (node.connectorEnd.endpointNodeId !== widgetId) continue;

    // Ignore connectors that don't start at a node
    if (!("endpointNodeId" in node.connectorStart)) continue;

    const startNode = figma.getNodeById(node.connectorStart.endpointNodeId);

    // Ignore connectors that don't start at a widget
    if (startNode?.type !== "WIDGET") continue;

    // Ignore connectors that don't start at a widget with a value
    if (typeof startNode.widgetSyncedState.value === "undefined") continue;

    // TODO: Check for errors on start node

    const variableName = node.text.characters;

    // Don't store variables without a name
    if (!variableName) continue;

    inputs[variableName] = startNode.widgetSyncedState.value;
  }

  return inputs;
}

widget.register(Widget);
