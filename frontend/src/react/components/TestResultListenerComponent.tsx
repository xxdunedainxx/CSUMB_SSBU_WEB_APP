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

  function isControllerTestCategory(category: string) {
    return category === "HeneveldControlllerParadigm";
  }

  function isResultMessage(event: MessageEvent) {
    return event.data?.type === "PSYTOOLKIT_RESULT" || event.data?.type === "CONTROLLER_TEST_RESULT";
  }

  function isReadyMessage(event: MessageEvent) {
    return (
      event.data?.type === "PSYTOOLKIT_PING" ||
      event.data?.type === "CONTROLLER_TEST_PING" ||
      event.data?.type === "CONTROLLER_TEST_READY"
    );
  }

  function finalize(){
    alert("Test done! Redirecting..")
    // window.location.href = "/dashboard/"
  }

  useEffect(() => {
    async function handler(event: MessageEvent) {
      if (isResultMessage(event)) {
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

          const testId = createRes.id;
          let uploadCompleted = false;
          
          if (testCategory === "GoNoGo") {
            console.log("Upload go/no-go results");

            const dataToUpload = listener.goNoGoToJson(event.data.payload);
            console.log(dataToUpload);
            const gngTestResults = (dataToUpload as any).gngTestResults.map((item: any) => ({
              ...item,
              testResultId: testId,
              id: -1,
            }));
            
            console.log(gngTestResults);
            await client.uploadGngResults({
              gngTestResults
            });
            uploadCompleted = true;
          } else if (testCategory === "Posner") {
            console.log("Posner upload");
            const dataToUpload = listener.posnerToJson(event.data.payload);
            console.log(dataToUpload);
            const posnerResults = (dataToUpload as any).posnerResults.map((item: any) => ({
              ...item,
              testResultId: testId,
              id: -1,
            }));
            
            console.log(posnerResults);
            await client.uploadPosnerResults({
              posnerResults
            });
            uploadCompleted = true;
          } else if (isControllerTestCategory(testCategory)) {
            console.log("Controller test upload");
            const dataToUpload = listener.controllerToJson(event.data.payload);
            const controllerResults = (dataToUpload as any).controllerResults.map((item: any) => ({
              ...item,
              testResultId: testId,
              id: -1,
            }));

            console.log(controllerResults);
            await client.uploadControllerResults({
              controllerResults
            });
            uploadCompleted = true;
          } else {
            console.log("UNKNOWN TEST TYPE");
          }

          if (uploadCompleted) {
            finalize();
          }

        } catch (err) {
          console.error("Failed processing test results:", err);
        }

      } else if (isReadyMessage(event)) {
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
