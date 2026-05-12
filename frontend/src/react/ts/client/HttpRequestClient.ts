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
    const res = await fetch(`${this.baseUrl}${path}`);

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return res.json();
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
}