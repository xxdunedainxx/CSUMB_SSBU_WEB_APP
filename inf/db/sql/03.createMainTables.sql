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
    TestOrTrial VARCHAR(100) NOT NULL,
    TrainingOrReal INT NOT NULL,
    NumberOfChoices INT NOT NULL,
    timeBetweenResponseAndNextTrial INT NOT NULL,
    XCoordinateTargetStim INT NOT NULL,
    ResponseTimeMS INT NOT NULL,
    StatusOfAnswer INT NOT NULL
);

CREATE TABLE IF NOT EXISTS gngTestResultData(
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    testResultId INT REFERENCES testResults(id), -- link back to entire testing set result
    GoNoGoAndTestOrTrial VARCHAR(1000) NOT NULL,
    ResponseTimeMs INT NOT NULL,
    ErrorStatus INT NOT NULL
);

CREATE TABLE IF NOT EXISTS taskSwitchingTestResultData(
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    testResultId INT REFERENCES testResults(id), -- link back to entire testing set result
    TaskSwitchTypeAndTestOrTrial VARCHAR(1000) NOT NULL, -- letter | numbers | mixed and TestOrTrial
    position INT NOT NULL,  --  position of stimulus 1,2,3,4 (top left, top right, bottom right, bottom left
    taskType INT NOT NULL,  -- 3 - tasktype (1 or 2)
    letterStimulus VARCHAR(100) NOT NULL, --  4 - the letter stimulus
    numberStimulus INT NOT NULL, -- the number stimulus
    typeOfBlock INT NOT NULL, --  6 - type of block (1=just task 1; 2=just task 2; 0=both tasks mixed)
    taskSwitchOrTaskRepeat INT NOT NULL, --  7 - 1=task switch , 0=task repeat
    statusOfAnswer INT NOT NULL, --  8 - status (1=correct, 2=error, 3=too slow)
    ResponseTimeMs INT NOT NULL,
    TotalTimeMs INT NOT NULL, --  10 - total time (response time + button release time)
);
CREATE TABLE IF NOT EXISTS posnerQueueTestResultData(
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    testResultId INT REFERENCES testResults(id), -- link back to entire testing set result
    TestOrTrial VARCHAR(100) NOT NULL, -- val of 'Test' or 'Trial' 
    cuePosition VARCHAR(100) NOT NULL, -- cue position (cueleft, cueright)
    targetPosition VARCHAR(100) NOT NULL, -- target position (targetleft, targetright)
    cueValidity VARCHAR(100) NOT NULL, --cue validity (cued, uncued)
    cueOrUncued VARCHAR(100) NOT NULL, -- cued or uncued 
    cueValidityAsNumber INT NOT NULL, -- cue validity as number (1=cued, 0=uncued)
    ResponseTimeMS INT NOT NULL, -- Response time (ms)
    ResponseStatus INT NOT NULL-- Status (1=correct, 2=wrong, 3=timeout)
);

-- TODO Feedback table
CREATE TABLE IF NOT EXISTS feedback();
