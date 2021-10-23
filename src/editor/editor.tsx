import React from "react";
import { render } from "react-dom";

function App() {
  return <div>hello world</div>;
}

render(<App />, document.getElementById("root"));

const editor = document.getElementById("editor");

// @ts-ignore
editor.addEventListener("input", event => {
  // @ts-ignore
  postMessage({ type: "codeChanged", code: event.target.value });
});

// TODO: Improve type safety of message passing
window.onmessage = async event => {
  const message = event.data.pluginMessage;
  switch (message.type) {
    case "initialize":
      // @ts-ignore
      editor.value = message.code;
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

function postMessage(message: any) {
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
