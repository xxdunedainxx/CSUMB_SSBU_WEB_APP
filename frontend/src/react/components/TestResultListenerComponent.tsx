import { useEffect } from "react";
import { TestResultListener } from "../ts/data/TestResultListener"

export default function TestResultListenerComponent({ testCategory }: { testCategory: string }) {

  useEffect(() => {
  function handler(event: MessageEvent) {
    if (event.data?.type === "PSYTOOLKIT_RESULT") {
      console.log("Received outputdata:", event.data.payload);
      const listener = new TestResultListener(testCategory);

      // send to your listener class
      listener.goNoGoToJson(event.data.payload);
    }
  }

  window.addEventListener("message", handler);

  return () => window.removeEventListener("message", handler);
}, []);

  return null;
}