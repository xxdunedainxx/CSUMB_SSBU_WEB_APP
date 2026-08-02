-- TEST DATA SEED, ONLY USED FOR DEV DATABASE IMAGES!!

INSERT INTO userTable (
    email,
    password,
    salt,
    verified,
    whenCreated,
    lastLogin,
    registrationToken
) VALUES (
    'user@example.com',
    -- sha256 of the plaintext + the salt below. Log in with the password: password
    'b12e451bb4ed8bf165d35345e7c99dd37d1a57fa708cbdbe02d32aa02a9f3a6e',
    'randSalt',
    true,
    NOW(),
    NOW(),
    'test'
);