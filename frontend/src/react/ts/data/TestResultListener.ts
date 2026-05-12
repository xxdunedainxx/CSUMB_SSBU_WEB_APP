export class TestResultListener {
  private testType: string;

  constructor(testType: string) {
    this.testType = testType;
  }

  /**
   * Convert CSV-like output into JSON
   */
  goNoGoToJson(outputData: string) {
    const gngData= outputData
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [name, value1, value2] = line.split(",");

        return {
          name: name.replace(/^"|"$/g, ""),
          value1: Number(value1),
          value2: Number(value2),
        };
      });
    console.log(gngData)
  }
}

export default TestResultListener;