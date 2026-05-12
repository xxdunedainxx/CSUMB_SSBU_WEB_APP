export class TestResultListener {
  private testType: string;

  constructor(testType: string) {
    this.testType = testType;

    console.log("Register listener")
    // TODO - iframe fetching 
    const iframe = document.getElementById("testWindow") as HTMLIFrameElement;
    const listener = this;
    const win = iframe.contentWindow as any;
    console.log("iframe loaded")
    win.originalShowDataHtml = win.showdata_html;

    win.showdata_html = () => {
        const outputdata = win.outputdata;

        if(listener.testType == "GoNoGo"){
            listener.goNoGoToJson(outputdata);
        }
        console.log("outputdata inside iframe:", win.outputdata);
    };
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