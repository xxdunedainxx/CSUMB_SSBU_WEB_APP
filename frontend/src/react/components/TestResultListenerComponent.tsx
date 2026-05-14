import { useEffect, useState } from "react";
import { TestResultListener } from "../ts/data/TestResultListener";

interface Props {
  testCategory: string;
  iframeSrc: string;
  testName: string;
}

export default function TestResultListenerComponent({
  testCategory,
  iframeSrc,
  testName,
}: Props) {

  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    function handler(event: MessageEvent) {
      if (event.data?.type === "PSYTOOLKIT_RESULT") {
        console.log("Received outputdata:", event.data.payload);

        const listener = new TestResultListener(testCategory);

        listener.goNoGoToJson(event.data.payload);
      } else if(event.data?.type === "PSYTOOLKIT_PING"){
        console.log("PING, TEST IS READY")
        setShowIframe(true)
      }
    }

    window.addEventListener("message", handler);

    return () => window.removeEventListener("message", handler);
  }, [testCategory]);

  return (
    <>
      {!showIframe && (
        <div>
          Loading..
        </div>
      )}
      
        <div className="test-iframe-wrapper">
          <iframe
            className="test-iframe"
            src={iframeSrc}
            title={testName}
            allow="fullscreen"
            id="testWindow"
            style={{
              visibility: showIframe ? "visible" : "hidden"
            }}
          />
        </div>

    </>
  );
}