CREATE TABLE IF NOT EXISTS userTable (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(1000) NOT NULL,
    password VARCHAR(1000) NOT NULL,
    salt VARCHAR(100) NOT NULL,
    verified BOOLEAN NOT NULL,
    whenCreated TIMESTAMPTZ,
    lastLogin TIMESTAMPTZ
);

-- TODO -
CREATE TABLE IF NOT EXISTS userDemographicInfo();

CREATE TABLE IF NOT EXISTS testResults (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    userID INT REFERENCES userTable(id),
    whenGenerated TIMESTAMPTZ,
    classification VARCHAR(100) -- Unclassified data could be queried by the ML Model?
);

-- Each may be in their own table
CREATE TABLE IF NOT EXISTS controllerTestResultData();

CREATE TABLE IF NOT EXISTS srtTestResultData(
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    testResultId INT REFERENCES testResults(id), -- link back to entire testing set result
    payload BYTEA NOT NULL
);

CREATE TABLE IF NOT EXISTS gngTestResultData(
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    testResultId INT REFERENCES testResults(id), -- link back to entire testing set result
    payload BYTEA NOT NULL
);

CREATE TABLE IF NOT EXISTS taskSwitchingTestResultData(
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    testResultId INT REFERENCES testResults(id), -- link back to entire testing set result
    payload BYTEA NOT NULL
);

CREATE TABLE IF NOT EXISTS posnerQueueTestResultData(
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    testResultId INT REFERENCES testResults(id), -- link back to entire testing set result
    payload BYTEA NOT NULL
);

-- TODO Feedback table
CREATE TABLE IF NOT EXISTS feedback();
