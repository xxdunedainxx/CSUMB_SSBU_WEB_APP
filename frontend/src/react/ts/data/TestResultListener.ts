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

  private parseControllerPayload(outputData: unknown): any {
    if (typeof outputData === "string") {
      return JSON.parse(outputData);
    }

    return outputData;
  }

  private getControllerResultType(payload: any): string {
    if (
      payload &&
      typeof payload === "object" &&
      "left" in payload &&
      "right" in payload &&
      "dual" in payload
    ) {
      return "combined";
    }

    if (payload?.settings?.stick === "left") {
      return "left";
    }

    if (payload?.settings?.stick === "right") {
      return "right";
    }

    if (typeof payload?.app_version === "string" && payload.app_version.includes("dual")) {
      return "dual";
    }

    return "session";
  }

  controllerToJson(outputData: unknown): {} {
    const payload = this.parseControllerPayload(outputData);

    return {
      controllerResults: [
        {
          resultType: this.getControllerResultType(payload),
          payload,
        },
      ],
    };
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

    srtToJson(outputData: string): {} {
    console.log("RAW SRT OUTPUT:", outputData);
    const srtData = outputData
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => {
             const [TestOrTraining, TrainingOrReal, NumberOfChoices, TimeBetweenResponseAndNextTrial, XCoordinateTargetStim,
      ResponseTimeMs, StatusOfAnswer] = line.split(" ");
            return {
                TestOrTraining,
                TrainingOrReal: Number(TrainingOrReal.replace(/^"|"$/g, "")),
                NumberOfChoices: Number(NumberOfChoices.replace(/^"|"$/g, "")),
                TimeBetweenResponseAndNextTrial: Number(TimeBetweenResponseAndNextTrial.replace(/^"|"$/g, "")),
                XCoordinateTargetStim: Number(XCoordinateTargetStim.replace(/^"|"$/g, "")),
                ResponseTimeMs: Number(ResponseTimeMs.replace(/^"|"$/g, "")),
                StatusOfAnswer: Number(StatusOfAnswer.replace(/^"|"$/g, ""))
            };
        });

      return {srtTestResults: srtData}
}
    taskSwitchToJson(outputData: string): {} {
        console.log("RAW TASK SWITCHING RESULT OUTPUT:", outputData);
        const taskData = outputData
            .trim()
            .split("\n")
            .filter(Boolean)
            .map((line) => {
                const [
                    TaskSwitchTypeAndTestOrTrial,
                    position,
                    taskType,
                    letterStimulus,
                    numberStimulus,
                    typeOfBlock,
                    taskSwitchOrTaskRepeat,
                    status,
                    ResponseTimeMs,
                    totalTimeMs
                ] = line.split(" ");
               return {
                   TaskSwitchTypeAndTestOrTrial: TaskSwitchTypeAndTestOrTrial.replace(/^"|"$/g, ""),
                   position: Number(position.replace(/^"|"$/g, "")),
                   taskType: Number(taskType.replace(/^"|"$/g, "")),
                   letterStimulus: letterStimulus.replace(/^"|"$/g, ""),
                   numberStimulus: Number(numberStimulus.replace(/^"|"$/g, "")),
                   typeOfBlock: Number(typeOfBlock.replace(/^"|"$/g, "")),
                   taskSwitchOrTaskRepeat: Number(taskSwitchOrTaskRepeat.replace(/^"|"$/g, "")),
                   status: Number(status.replace(/^"|"$/g, "")),
                   ResponseTimeMs: Number(ResponseTimeMs.replace(/^"|"$/g, "")),
                   totalTimeMs: Number(totalTimeMs.replace(/^"|"$/g, ""))
               };
            });

        return {taskSwitchingResults: taskData};
    }
}

export default TestResultListener;
