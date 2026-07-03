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
    'password', -- note this will be a hash alter
    'randSalt',
    true,
    NOW(),
    NOW(),
    'test'
);