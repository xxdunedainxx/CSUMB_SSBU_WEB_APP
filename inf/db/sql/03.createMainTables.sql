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
CREATE TABLE userDemographicInfo();

CREATE TABLE testResults (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    userID INT REFERENCES userTable(id),
    whenGenerated TIMESTAMPTZ,
    classification VARCHAR(100) -- Unclassified data could be queried by the ML Model?
);

-- Each may be in their own table
CREATE TABLE controllerTestResultData();

CREATE TABLE srtTestResultData(
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    testResultId INT REFERENCES testResults(id), -- link back to entire testing set result
    TestOrTrial VARCHAR(100) NOT NULL,
    TrainingOrReal INT NOT NULL,
    NumberOfChoices INT NOT NULL,
    timeBetweenResponseAndNextTrial INT NOT NULL,
    XCoordinateTargetStim INT NOT NULL,
    ResponseTimeMS INT NOT NULL,
    StatusOfAnswer INT NOT NULL
);

-- TODO
CREATE TABLE gngTestResultData();
CREATE TABLE taskSwitchingTestResultData();
CREATE TABLE posnerQueueTestResultData();

-- TODO Feedback table