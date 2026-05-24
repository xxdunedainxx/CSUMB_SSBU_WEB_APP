import { useEffect, useMemo, useState } from 'react';
import Setup from '../ts/util/Setup'
import { HttpRequestClient } from '../ts/client/HttpRequestClient';

const setup = new Setup();

export const client = new HttpRequestClient(
  setup.config.remoteHost,
  setup.config.remoteHostPort
);

type TestResult = any;

/**
 * Dashboard Component 
 * @param param0 
 * @returns 
 */
export default function Dashboard({ userId }: { userId: number }) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setup.run();
  }, [setup]);

  useEffect(() => {
    async function load() {
      try {
        console.log("load data");

        const idsData = await client.getAllTestIds(userId);
        const testIds = idsData.testIds;

        const testResults = await Promise.all(
          testIds.map((testId) =>
            client.getTestResult(userId, testId)
          )
        );

        setResults(testResults);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [client, userId]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {results.map((result) => (
        <div key={result.testResult.id} className="test-card">
          <h2>Test ID: {result.testResult.id}</h2>

          <p>
            <strong>Classification:</strong> {result.testResult.classification}
          </p>

          <p>
            <strong>Generated:</strong> {result.testResult.whenGenerated}
          </p>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Response Time (ms)</th>
                <th>Error</th>
              </tr>
            </thead>

            <tbody>
              {result.gngRecords.map((record: any) => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>{record.GoNoGoAndTestOrTrial}</td>
                  <td>{record.ResponseTimeMs}</td>
                  <td>{record.ErrorStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
    
  );
}