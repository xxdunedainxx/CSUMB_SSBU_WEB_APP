import { useEffect } from "react";
import { TestResultListener } from "../ts/data/TestResultListener"

export default function TestResultListenerComponent({ testCategory }: { testCategory: string }) {

  /**
   * Main Event Handler from the Iframe 
   * 
   * TODO - Also add a 'PSYTOOLKIT_PING' that comes when the page has loaded, indicating the iframe CAN send messages to the component 
   * - This can be used as a 'health check' of the iframe to ensure that its loaded. We may want to display a 'loading...' message or somethig like that until the iframe sends a 'PING' message 
   */
  useEffect(() => {
  function handler(event: MessageEvent) {
    if (event.data?.type === "PSYTOOLKIT_RESULT") {
      console.log("Received outputdata:", event.data.payload);
      const listener = new TestResultListener(testCategory);
      listener.goNoGoToJson(event.data.payload);
    }
  }

  window.addEventListener("message", handler);

  return () => window.removeEventListener("message", handler);
}, []);

  return null;
}