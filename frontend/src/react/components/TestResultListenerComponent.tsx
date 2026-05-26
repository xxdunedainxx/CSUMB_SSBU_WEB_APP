import { useEffect, useState } from "react";
import { TestResultListener } from "../ts/data/TestResultListener";
import { HttpRequestClient } from "../ts/client/HttpRequestClient";
import Setup from "../ts/util/Setup";

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

  const setup = new Setup();
  
  const client = new HttpRequestClient(
    setup.config.remoteHost,
    setup.config.remoteHostPort
  );
  

  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    function handler(event: MessageEvent) {
      if (event.data?.type === "PSYTOOLKIT_RESULT") {
        console.log("Received outputdata:", event.data.payload);
        const userId=1
        const listener = new TestResultListener(testCategory);
        // TODO - support other types of test result uploads 
        if(testCategory == "GoNoGo"){
          console.log("Upload go/no-go results")
          const dataToUpload = listener.goNoGoToJson(event.data.payload);
          
          client.uploadGngResults(dataToUpload)
        } else {
          console.log("UNKNOWN TEST TYPE")
        }
        // TODO Display results inline?
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