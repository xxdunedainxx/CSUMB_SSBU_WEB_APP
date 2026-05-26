export class TestResultListener {
  private testType: string;

  constructor(testType: string) {
    this.testType = testType;
  }

  /**
   * Convert CSV-like output into JSON
   */
  goNoGoToJson(outputData: string): {} {
    const gngData= outputData
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [name, ResponseTimeMs, ErrorStatus] = line.split(" ");
        return {
          name: name.replace(/^"|"$/g, ""),
          ResponseTimeMs: Number(ResponseTimeMs.replace(/^"|"$/g, "")),
          ErrorStatus: Number(ErrorStatus.replace(/^"|"$/g, "")),
        };
      });
    console.log(gngData)
    return {gngTestResults: gngData}
  }
}

export default TestResultListener;