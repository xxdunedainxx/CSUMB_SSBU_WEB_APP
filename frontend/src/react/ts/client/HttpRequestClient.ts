/**
 * Central HTTP Client for the client side application
 */
export class HttpRequestClient {
  private baseUrl: string;

  constructor(host: string, port: number = 80, hostRoute = "") {
    this.baseUrl = `http://${host}:${port}${hostRoute}`;
  }

  // General get method 
  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
    });

    if (!res.ok) {
      // TODO IMPROVE
      if(res.status == 401){
        window.location.href = "/ui/login/";
      }
      else {
        throw new Error(`API error: ${res.status}`);
      }
    }

    return res.json();
  }

  private async post<T>(path: string, body: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: body,
    });
    console.log(res)
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json()
    console.log(data)

    return data;
  }


  // Upload Posner
  uploadPosnerResults(data: {}){
    console.log("Upload Posner results")
    console.log(data)
    return this.post<any>(
      '/upload_posner_results',
      JSON.stringify(data)
    );
  }

  // Upload Gng results
  uploadGngResults(data: {}){
    console.log("Upload Gng results")
    console.log(data)
    return this.post<any>(
      '/upload_gng_test_results',
      JSON.stringify(data)
    );
  }

  uploadSrtResults(data: {}) {
    console.log("Upload SRT Results");
    console.log(data);
    return this.post<any>(
        '/upload_srt_results',
        JSON.stringify(data)
    );
  }

  // Get test IDs method 
  getAllTestIds(userId: number) {
    return this.get<{ testIds: number[] }>(
      `/get_all_test_ids/${userId}`
    );
  }

  getTestResult(userId: number, testId: number) {
    return this.get<any>(
      `/get_test_result_data/${userId}/${testId}`
    );
  }

  login(email: string, password: string){
      return this.post<any>(
        '/login',
        JSON.stringify({ email, password }),
      );
  }

  register(email: string, password: string){
      return this.post<any>(
        '/register',
        JSON.stringify({ email, password }),
      );
  }

  feedback(feedback: string){
      return this.post<any>(
        '/feedback',
        JSON.stringify({ feedback }),
      );
  }


  verifyAccount(verificationToken){
      return this.get<any>(
        `/verify/${verificationToken}`,
      );
  }

  logout(){
      return this.post<any>(
        '/logout',
        "",
      );
  }

  me(){
      return this.get<any>(
        '/me'
      );
  }

  createNewTestId(userId: number, classification: string){
      return this.post<any>(
        '/create_new_test_result_entry',
        JSON.stringify({userId, classification})
      );
  }
}