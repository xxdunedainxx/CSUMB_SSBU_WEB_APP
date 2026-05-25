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
          GoNoGoAndTestOrTrial: name.replace(/^"|"$/g, ""),
          ResponseTimeMs: Number(ResponseTimeMs.replace(/^"|"$/g, "")),
          ErrorStatus: Number(ErrorStatus.replace(/^"|"$/g, "")),
        };
      });
    console.log(gngData)
    return {gngTestResults: gngData}
  }
  
  /**
   * Ex: 
        "TestOrTraining": "TEST",
        "CuePosition": "CENTER",
        "TargetPosition": "RIGHT",
        "CueValidity": "NEUTRAL",
        "CuedOrUncued": "UNCUED",
        "CueValidityAsNumber": -1,
        "ResponseTimeMs": 295,
        "ResponseStatus": 0
   * @param outputData 
   * @returns 
   */
    posnerToJson(outputData: string): {} {
    const posnerData = outputData
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => {

        const [
            TestOrTraining,
            CuePosition,
            TargetPosition,
            CueValidity,
            CuedOrUncued,
            CueValidityAsNumber,
            ResponseTimeMs,
            ResponseStatus
        ] = line.trim().split(/\s+/);

        return {
            TestOrTraining,
            CuePosition,
            TargetPosition,
            CueValidity,
            CuedOrUncued,
            CueValidityAsNumber: Number(CueValidityAsNumber),
            ResponseTimeMs: Number(ResponseTimeMs),
            ResponseStatus: Number(ResponseStatus),
        };
        });

    console.log(posnerData);

    return { posnerResults: posnerData };
    }
}

export default TestResultListener;