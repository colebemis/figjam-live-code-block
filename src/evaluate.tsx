export type ValueType =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

export type EvaluateReturnValue =
  | {
      value: string;
      type: ValueType;
      error: null;
    }
  | {
      value: null;
      type: null;
      error: string;
    };

/** Evaluates JavaScript expressions stored as strings */
export function evaluate(
  widgetId: string,
  expression: string
): EvaluateReturnValue {
  // setTimeout(() => {
  //   console.log("delay");
  // }, 1000);
  return { value: "hello", type: "string", error: null };
}

// function getInputs(widgetId: string): Record<string, any> {
//   const inputs = {}

//   return inputs
// }

// function isConnectorValid(node: SceneNode) {
//   return  (
//     // is a connector node
//     node.type === "CONNECTOR" &&
//     // points to current widget
//     "endpointNodeId" in node.connectorEnd &&
//       node.connectorEnd.endpointNodeId === widgetId &&
// }
