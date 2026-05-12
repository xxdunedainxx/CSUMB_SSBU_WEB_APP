import { useEffect } from "react";
import { TestResultListener } from "../ts/data/TestResultListener"

export default function TestResultListenerComponent({ testCategory }: { testCategory: string }) {
  useEffect(() => {
    const listener = new TestResultListener(testCategory);
  }, []);

  return null;
}