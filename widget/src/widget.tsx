import colors from "tailwindcss/colors";
import { ValueType, WidgetMessage } from "../../types";
import {
  connectNodes,
  getEditorUI,
  getInputs,
  postMessage,
  transferConnectors,
} from "./utils";
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

  // TODO: Figure out a better name for this function
  async function clone(widgetId: string) {
    const widgetNode = figma.getNodeById(widgetId) as WidgetNode;

    // Clone the current widget
    const clonedWidgetNode = widgetNode.clone();

    // Move the current widget to the right of the clone
    widgetNode.x += clonedWidgetNode.width + 160;

    // Transfer connectors to clone
    transferConnectors(widgetNode, clonedWidgetNode);

    // Add connector between clone and the current widget
    await connectNodes(clonedWidgetNode, widgetNode, "value");

    // Change code of current widget
    setCode("value");
  }

  usePropertyMenu(
    [
      {
        tooltip: "Run",
        propertyName: "run",
        itemType: "action",
      },
      {
        tooltip: "Edit",
        propertyName: "edit",
        itemType: "action",
      },
      {
        // TODO: Figure out a better name for this action
        tooltip: "Clone",
        propertyName: "clone",
        itemType: "action",
      },
    ],
    ({ propertyName }) => {
      switch (propertyName) {
        case "edit":
          figma.showUI(getEditorUI(), { width: 500, height: 300 });
          const inputs = getInputs(widgetId);
          postMessage({ type: "initialize", code, inputs });

          // Keep UI open
          return new Promise<void>(() => {});

        case "run":
          figma.showUI(getEditorUI(), { visible: false });
          waitForTask(run(code));
          return;

        case "clone":
          waitForTask(clone(widgetId));
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

          run(code);
          break;
      }
    };
  });

  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="start"
      verticalAlignItems="start"
      width="hug-contents"
      height="hug-contents"
      fill={colors.coolGray[800]}
      cornerRadius={12}
      effect={[
        {
          type: "drop-shadow",
          color: { r: 0, g: 0, b: 0, a: 0.2 },
          offset: { x: 0, y: 1 },
          blur: 2,
          spread: 0,
        },
        {
          type: "drop-shadow",
          color: { r: 0, g: 0, b: 0, a: 0.15 },
          offset: { x: 0, y: 4 },
          blur: 8,
          spread: 0,
        },
      ]}
    >
      {/* HACK: Set min-width of widget to 400 */}
      <Frame width={300} height={0.01} />
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
        width="hug-contents"
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
            width="hug-contents"
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
              width="hug-contents"
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
                  onClick={() => setIsExpanded(true)}
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

widget.register(Widget);
