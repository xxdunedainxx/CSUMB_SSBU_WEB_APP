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

  function finalize(){
    alert("Test done! Redirecting..")
    // window.location.href = "/dashboard/"
  }

  useEffect(() => {
    async function handler(event: MessageEvent) {
      if (event.data?.type === "PSYTOOLKIT_RESULT") {
        try {
          console.log("Received outputdata:", event.data.payload);

          const listener = new TestResultListener(testCategory);

          // 1. GET user info
          const me = await client.me();
          const userId = me.user_id;

          // 2. Create test ID
          const createRes = await client.createNewTestId(
            userId,
            testCategory
          );

          const testId = createRes.id; // adjust field name if different
          
          if (testCategory == "GoNoGo") {
            console.log("Upload go/no-go results");

            const dataToUpload = listener.goNoGoToJson(event.data.payload);
            console.log(dataToUpload)
            const gngTestResults = (dataToUpload as any).gngTestResults.map((item: any) => ({
              ...item,
              testResultId: testId,
              id: -1,
            }));
            
            console.log(gngTestResults)
            // 3. Upload results (attach IDs if needed)
            await client.uploadGngResults({
              gngTestResults
            });
          } else if(testCategory == "Posner") {
            console.log("Posner upload")
            const dataToUpload = listener.posnerToJson(event.data.payload);
            console.log(dataToUpload)
            const posnerResults = (dataToUpload as any).posnerResults.map((item: any) => ({
              ...item,
              testResultId: testId,
              id: -1,
            }));
            
            console.log(posnerResults)
            // 3. Upload results (attach IDs if needed)
            await client.uploadPosnerResults({
              posnerResults
            });
          } else {
            console.log("UNKNOWN TEST TYPE");
          }

        } catch (err) {
          console.error("Failed processing test results:", err);
        }

        finalize()

      } else if (event.data?.type === "PSYTOOLKIT_PING") {
        console.log("PING, TEST IS READY");
        setShowIframe(true);
      }
    }

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [client, testCategory]);

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