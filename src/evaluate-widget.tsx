export type ValueType =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

export type EvaluateWidgetReturnValue =
  | {
      value: string;
      type: ValueType;
      error: "";
    }
  | {
      value: null;
      type: null;
      error: string;
    };

export function evaluateWidget(
  widgetId: string,
  code: string
): EvaluateWidgetReturnValue {
  try {
    const inputVariables = getInputVariables(widgetId);

    console.log(code);
    const value = evaluate(code, inputVariables);
    console.log(value);

    return { value: valueToString(value), type: typeof value, error: "" };
  } catch (error) {
    console.error(error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return { value: null, type: null, error: errorMessage };
  }
}

function getInputVariables(widgetId: string): Record<string, any> {
  const inputVariables: Record<string, any> = {};

  // Search all nodes in the document
  figma.currentPage.children.forEach(node => {
    // Ignore nodes that aren't connectors
    if (node.type !== "CONNECTOR") return;

    // Ignore connectors that don't end at a node
    if (!("endpointNodeId" in node.connectorEnd)) return;

    // Ignore connectors that don'e end at the current widget
    if (node.connectorEnd.endpointNodeId !== widgetId) return;

    // Ignore connectors that don't start at a node
    if (!("endpointNodeId" in node.connectorStart)) return;

    const startNode = figma.getNodeById(node.connectorStart.endpointNodeId);

    // Ignore connectors that don't start at a widget
    if (startNode?.type !== "WIDGET") return;

    // Ignore connectors that don't start at a widget with a value
    if (typeof startNode.widgetSyncedState.value === "undefined") return;

    // TODO: Check for errors on start node

    const variableName = node.text.characters;

    const value = evaluate(startNode.widgetSyncedState.value);

    // Don't store variables without a name
    if (!variableName) return;

    inputVariables[variableName] = value;
  });

  return inputVariables;
}

function evaluate(code: string, scope: Record<string, any> = {}) {
  const fn = new Function(...Object.keys(scope), `return ${code}`);
  return fn(...Object.values(scope));
}

function valueToString(value: any): string {
  switch (typeof value) {
    case "function":
      return value.toString();
    default:
      return JSON.stringify(value, null, 2);
  }
}
