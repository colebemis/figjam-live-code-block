import MonacoEditor from "@monaco-editor/react";
import React from "react";
import { EditorMessage, WidgetMessage } from "../../../types";
import mapObj from "map-obj";

export function Editor() {
  const [code, setCode] = React.useState("");

  window.onmessage = async (
    event: MessageEvent<{ pluginMessage?: EditorMessage }>
  ) => {
    const message = event.data.pluginMessage;

    if (!message) return;

    switch (message.type) {
      case "initialize":
        setCode(message.code);
        break;

      case "evaluate":
        try {
          const { code, inputs } = message;
          const scope = { fetch, ...parseInputValues(inputs) };

          // eslint-disable-next-line no-new-func
          const fn = new Function(...Object.keys(scope), `return ${code}`);
          const value = await fn(...Object.values(scope));

          postMessage({
            type: "codeEvaluated",
            value: valueToString(value),
            valueType: typeof value,
            error: "",
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          postMessage({
            type: "codeEvaluated",
            value: null,
            valueType: null,
            error: errorMessage,
          });
        }
        break;
    }
  };

  return (
    <MonacoEditor
      language="javascript"
      value={code}
      onChange={value => {
        const code = value || "";
        setCode(code);
        postMessage({ type: "codeChanged", code });
      }}
      height="100vh"
      options={{
        minimap: { enabled: false },
      }}
    />
  );
}

function postMessage(message: WidgetMessage) {
  // eslint-disable-next-line no-restricted-globals
  parent.postMessage({ pluginMessage: message, pluginId: "*" }, "*");
}

function valueToString(value: any) {
  switch (typeof value) {
    case "function":
    case "undefined":
      return String(value);

    default:
      return JSON.stringify(value, null, 2);
  }
}

function parseInputValues(inputs: Record<string, string>): Record<string, any> {
  return mapObj(inputs, (key, value) => {
    // eslint-disable-next-line no-new-func
    const parsedValue = new Function(`return ${value}`)();
    return [key, parsedValue];
  });
}
