const mongoose = require('mongoose');

let transactionsSupported = null;

/**
 * Detects (once, lazily) whether the connected MongoDB deployment supports
 * multi-document transactions. Transactions require a replica set or mongos;
 * a standalone mongod does not support them.
 */
async function detectTransactionSupport() {
  if (transactionsSupported !== null) return transactionsSupported;
  try {
    const admin = mongoose.connection.db.admin();
    const status = await admin.command({ hello: 1 });
    // `setName` is present only when the node is part of a replica set.
    transactionsSupported = Boolean(status.setName || status.msg === 'isdbgrid');
  } catch {
    transactionsSupported = false;
  }
  return transactionsSupported;
}

/**
 * Runs `work(session)` inside a transaction when the deployment supports it,
 * otherwise runs `work(null)` without a session. Either way, the atomic
 * conditional updateMany inside `work` provides the double-booking guarantee.
 *
 * `work` should use the provided session for all reads/writes (pass it through
 * to `.session(session)` / `{ session }`). When session is null, those calls
 * simply run without a session, which Mongoose handles transparently.
 */
async function withTransaction(work) {
  const supported = await detectTransactionSupport();

  if (!supported) {
    // Standalone mongod — no transaction available. The conditional
    // updateMany still prevents double-booking; we just lose all-or-nothing
    // grouping with the reservation/booking document write.
    return work(null);
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await work(session);
    await session.commitTransaction();
    return result;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

module.exports = { withTransaction, detectTransactionSupport };
