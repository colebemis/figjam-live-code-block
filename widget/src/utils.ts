import { ValueType, EditorMessage, WidgetMessage } from "../../types";

export function postMessage(message: EditorMessage) {
  figma.ui.postMessage(message);
}

export function getEditorUI() {
  const editorUrl =
    process.env.NODE_ENV === "production"
      ? "https://figjam-javascript-repl.vercel.app/"
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

export async function connectNodes(
  startNode: BaseNode,
  endNode: BaseNode,
  connectorText?: string
) {
  const connector = figma.createConnector();

  connector.connectorStart = {
    endpointNodeId: startNode.id,
    magnet: "AUTO",
  };

  connector.connectorEnd = {
    endpointNodeId: endNode.id,
    magnet: "AUTO",
  };

  if (connectorText) {
    // Font needs to be loaded before changing the text characters
    // Reference: https://www.figma.com/plugin-docs/api/properties/TextNode-characters/
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    connector.text.characters = connectorText;
  }
}

export function transferConnectors(from: BaseNode, to: BaseNode) {
  for (const node of figma.currentPage.children) {
    // Ignore nodes that aren't connectors
    if (node.type !== "CONNECTOR") continue;

    // Tranfer connectors that start at `from` node
    if (
      "endpointNodeId" in node.connectorStart &&
      node.connectorStart.endpointNodeId === from.id
    ) {
      node.connectorStart = {
        ...node.connectorStart,
        endpointNodeId: to.id,
      };
    }

    // Tranfer connectors that end at `from` node
    if (
      "endpointNodeId" in node.connectorEnd &&
      node.connectorEnd.endpointNodeId === from.id
    ) {
      node.connectorEnd = {
        ...node.connectorEnd,
        endpointNodeId: to.id,
      };
    }
  }
}
