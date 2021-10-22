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

export async function evaluateWidget(
  widgetId: string,
  code: string
): Promise<EvaluateWidgetReturnValue> {
  try {
    const inputVariables = await getInputVariables(widgetId);

    const value = await evaluate(code, inputVariables);

    return { value: valueToString(value), type: typeof value, error: "" };
  } catch (error) {
    console.error(error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return { value: null, type: null, error: errorMessage };
  }
}

async function getInputVariables(widgetId: string) {
  const inputVariables: Record<string, any> = {};

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

    const value = await evaluate(startNode.widgetSyncedState.value);

    // Don't store variables without a name
    if (!variableName) continue;

    inputVariables[variableName] = value;
  }

  return inputVariables;
}

async function evaluate(code: string, scope: Record<string, any> = {}) {
  const fn = new Function(...Object.keys(scope), `return ${code}`);
  return await fn(...Object.values(scope));
}

function valueToString(value: any): string {
  switch (typeof value) {
    case "function":
      return value.toString();
    default:
      return JSON.stringify(value, null, 2);
  }
}
