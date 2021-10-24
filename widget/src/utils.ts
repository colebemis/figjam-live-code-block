import { ValueType, EditorMessage, WidgetMessage } from "../../types";

export function postMessage(message: EditorMessage) {
  figma.ui.postMessage(message);
}

export function getEditorUI() {
  // TODO: Replace https://vscode.dev with production editor URL
  const editorUrl =
    process.env.NODE_ENV === "production"
      ? "https://vscode.dev"
      : "http://localhost:3000";

  return `<script>window.location.href = '${editorUrl}'</script>`;
}

export function getInputs(widgetId: string) {
  const inputs: Record<string, string> = {};

  // Search all nodes in the document
  for (const node of figma.currentPage.children) {
    // Ignore nodes that aren't connectors
    if (node.type !== "CONNECTOR") continue;

    // Ignore connectors that don't end at a node
    if (!("endpointNodeId" in node.connectorEnd)) continue;

    // Ignore connectors that don't end at the current widget
    if (node.connectorEnd.endpointNodeId !== widgetId) continue;

    // Ignore connectors that don't start at a node
    if (!("endpointNodeId" in node.connectorStart)) continue;

    const startNode = figma.getNodeById(node.connectorStart.endpointNodeId);

    // Ignore connectors that don't start at a widget
    if (startNode?.type !== "WIDGET") continue;

    // Ignore connectors that don't start at a widget with a value
    if (typeof startNode.widgetSyncedState.value === "undefined") continue;

    const variableName = node.text.characters;

    // Don't store variables without a name
    if (!variableName) continue;

    // Get widget value
    const widgetState = startNode.widgetSyncedState;
    const value = widgetState.error ? undefined : widgetState.value;

    inputs[variableName] = value;
  }

  return inputs;
}