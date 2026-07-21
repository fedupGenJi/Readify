/**
 * Central registry of every table's schema module.
 *
 * To add a new table as the product grows:
 *   1. Create src/db/schema/<table>.schema.js following the same shape
 *      ({ name, temporary, sql: [...] }).
 *   2. Import it and add it to this array (permanent tables can go anywhere,
 *      but keep tables before anything that references them via foreign key).
 *
 * db/init.js just loops over this list - it never needs to change.
 */
const users = require('./users.schema');
const tempUsers = require('./tempUsers.schema');

module.exports = [
  users,
  tempUsers,
  // etc get added here later
];