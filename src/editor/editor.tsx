import React from "react";
import { render } from "react-dom";
import { EditorMessage, WidgetMessage } from "../types";

function Editor() {
  const [code, setCode] = React.useState("cole");

  window.onmessage = async (
    event: MessageEvent<{ pluginMessage: EditorMessage }>
  ) => {
    const message = event.data.pluginMessage;
    switch (message.type) {
      case "initialize":
        setCode(message.code);
        break;

      case "evaluate":
        try {
          const { code, inputs } = message;
          const scope = { fetch, ...inputs };

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
    <textarea
      value={code}
      onInput={event => {
        setCode(event.currentTarget.value);
        postMessage({ type: "codeChanged", code: event.currentTarget.value });
      }}
    />
  );
}

function postMessage(message: WidgetMessage) {
  parent.postMessage({ pluginMessage: message }, "*");
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

render(<Editor />, document.getElementById("root"));
