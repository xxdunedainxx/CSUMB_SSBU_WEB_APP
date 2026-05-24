/**
 * Central HTTP Client for the client side application
 */
export class HttpRequestClient {
  private baseUrl: string;

  constructor(host: string, port: number = 80) {
    this.baseUrl = `http://${host}:${port}`;
  }

  // General get method 
  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
    });

    if (!res.ok) {
      // TODO IMPROVE
      if(res.status == 401){
        window.location.href = "/login";
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

  // Upload Gng results
  uploadGngResults(data: {}){
    console.log("Upload Gng results")
    console.log(data)
    return this.post<any>(
      '/upload_gng_test_results',
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