\echo 'Delete and recreate pernstack db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE pernstack;
CREATE DATABASE pernstack;
\connect pernstack

\i pernstack-schema.sql
\i pernstack-seed.sql

-- \echo 'Delete and recreate l4j_test db?'
-- \prompt 'Return for yes or control-C to cancel > ' foo

-- DROP DATABASE l4j_test;
-- CREATE DATABASE l4j_test;
-- \connect l4j_test

-- \i l4j-schema.sql