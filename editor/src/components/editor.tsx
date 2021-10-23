import MonacoEditor, { useMonaco } from "@monaco-editor/react";
import React from "react";
import { EditorMessage, WidgetMessage } from "../../../types";
import mapObj from "map-obj";

export function Editor() {
  const [code, setCode] = React.useState("");
  const [inputs, setInputs] = React.useState<Record<string, any>>({});

  window.onmessage = async (
    event: MessageEvent<{ pluginMessage?: EditorMessage }>
  ) => {
    const message = event.data.pluginMessage;

    if (!message) return;

    switch (message.type) {
      case "initialize":
        setCode(message.code);
        setInputs(parseInputValues(message.inputs));
        break;

      case "evaluate":
        try {
          const { code, inputs } = message;

          const scope = {
            fetch,
            fetchJson,
            ...parseInputValues(inputs),
          };

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

  const monaco = useMonaco();

  // Add IntelliSense support for input variables
  React.useEffect(() => {
    const inputsLib = Object.entries(inputs)
      .map(([name, value]) => `declare const ${name}: ${valueToType(value)}`)
      .join("\n");

    monaco?.languages.typescript.javascriptDefaults.addExtraLib(
      inputsLib,
      "inputs"
    );
  }, [monaco, inputs]);

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

/** A convenient wrapper around `fetch` just for JSON */
async function fetchJson(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  return response.json();
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

function valueToType(value: any): string {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "Array<unknown>";

    return `Array<${valueToType(value[0])}>`;
  }

  const valueType = typeof value;

  switch (valueType) {
    case "object":
      const entries: string[] = Object.entries(value).map(
        ([key, value]) => `${key}: ${valueToType(value)}`
      );

      return `{ ${entries.join(";")} }`;

    case "function":
      // TODO: get parameter names
      return "Function";

    default:
      return valueType;
  }
}
