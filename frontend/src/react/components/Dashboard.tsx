import { useEffect, useMemo, useState } from 'react';
import Setup from '../ts/util/Setup'
import { HttpRequestClient } from '../ts/client/HttpRequestClient';

const setup = new Setup();

export const client = new HttpRequestClient(
  setup.config.remoteHost,
  setup.config.remoteHostPort,
  setup.config.remoteHostPath
);

type TestResult = any;

/**
 * Dashboard Component 
 * @param param0 
 * @returns 
 */
export default function Dashboard() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setup.run();
  }, [setup]);

  useEffect(() => {
    async function load() {
      try {
        console.log("load data");
        const me = await client.me();
        const userId = me.user_id;
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
  }, [client]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      {results.map((result) => (
        <div key={result.testResult.id} className="test-card">
          <h2>Test ID: {result.testResult.id}</h2>

          <div className="meta">
            <p>
              <strong>Classification:</strong>{" "}
              {result.testResult.classification}
            </p>

            <p>
              <strong>Generated:</strong>{" "}
              {result.testResult.whenGenerated}
            </p>
          </div>

          {result.gngRecords != null && (
            <div className="table-wrapper">
              <table className="styled-table">
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
          )}

          {result.posnerRecords != null && (
            <div className="table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Test/Train</th>
                    <th>Cue Position</th>
                    <th>Target Position</th>
                    <th>Cue Valid?</th>
                    <th>Cue/Uncued</th>
                    <th>Cue val as #</th>
                    <th>Response Time</th>
                    <th>Response Status</th>
                  </tr>
                </thead>

                <tbody>
                  {result.posnerRecords.map((record: any) => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>{record.TestOrTraining}</td>
                      <td>{record.CuePosition}</td>
                      <td>{record.TargetPosition}</td>
                      <td>{record.CueValidity}</td>
                      <td>{record.CuedOrUncued}</td>
                      <td>{record.CueValidityAsNumber}</td>
                      <td>{record.ResponseTimeMs}</td>
                      <td>{record.ResponseStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.controllerRecords != null && result.controllerRecords.length > 0 && (
             <div className="table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Result Type</th>
                    <th>Generated</th>
                    <th>Trial Count</th>
                  </tr>
                </thead>

                <tbody>
                  {result.controllerRecords.map((record: any) => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>{record.resultType}</td>
                      <td>{record.payload?.generated ?? record.payload?.metadata?.generated ?? "N/A"}</td>
                      <td>
                        {Array.isArray(record.payload?.trials)
                          ? record.payload.trials.length
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {result.srtRecords != null && (
            <div className="table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Test/Train</th>
                    <th>Training/Real</th>
                    <th>Time between response and next trial</th>
                    <th>X-Coordinate target stim</th>
                    <th>Response Time</th>
                    <th>Response Status</th>
                    <th>Number of Choices</th>
                  </tr>
                </thead>

                <tbody>
                  {result.srtRecords.map((record: any) => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>{record.TestOrTraining}</td>
                      <td>{record.TrainingOrReal}</td>
                      <td>{record.TimeBetweenResponseAndNextTrial}</td>
                      <td>{record.XCoordinateTargetStim}</td>
                      <td>{record.ResponseTimeMs}</td>
                      <td>{record.StatusOfAnswer}</td>
                      <td>{record.NumberOfChoices}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
        </div>
      ))}
    </div>
  );
}
