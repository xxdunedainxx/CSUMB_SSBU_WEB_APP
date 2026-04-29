-- TEST DATA SEED, ONLY USED FOR DEV DATABASE IMAGES!!

INSERT INTO userTable (
    email,
    password,
    salt,
    verified,
    whenCreated,
    lastLogin
) VALUES (
    'user@example.com',
    'password', -- note this will be a hash alter
    'randSalt',
    false,
    NOW(),
    NOW()
);