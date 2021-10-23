export type ValueType =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

// Messages that the editor can receive
export type EditorMessage =
  | { type: "initialize"; code: string }
  | { type: "evaluate"; code: string; inputs: Record<string, string> };

// Messages that the widget can recieve
export type WidgetMessage =
  | { type: "codeChanged"; code: string }
  | { type: "codeEvaluated"; value: string; valueType: ValueType; error: "" }
  | { type: "codeEvaluated"; value: null; valueType: null; error: string };
