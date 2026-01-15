# Archival System Migration Guide

## Overview

As of version 2.2.0, the NDAX Quantum Engine implements a comprehensive archival system that replaces all deletion operations with soft deletes. This ensures zero data loss, complete audit trails, and the ability to restore archived items.

## What Changed?

### Before (v2.1.0 and earlier)
```javascript
// Old approach - permanent deletion
webhookManager.deleteWebhook(webhookId);
// Data is gone forever ❌

database.deleteJob(jobId);
// Job is permanently removed ❌
```

### After (v2.2.0+)
```javascript
// New approach - archival with metadata
webhookManager.deleteWebhook(webhookId);
// Data is archived, not deleted ✅
// Can still be retrieved and restored ✅

database.deleteJob(jobId);
// Job is archived with metadata ✅
// Historical data preserved ✅
```

## Key Changes by Module

### 1. Webhook Manager (`src/shared/webhookManager.js`)

**New Properties:**
- `archivedWebhooks: Map` - Stores archived webhooks

**New Methods:**
```javascript
// Archive a webhook explicitly
webhookManager.archiveWebhook(id, optionalArchivedData);

// Restore an archived webhook
webhookManager.restoreWebhook(id);

// Get webhook (searches both active and archived)
webhookManager.getWebhook(id); // Now searches archived too
```

**Changed Behavior:**
```javascript
// deleteWebhook now archives instead of deletes
// Logs deprecation warning but still works
webhookManager.deleteWebhook(id);
// Equivalent to: webhookManager.archiveWebhook(id);
```

### 2. Database (`src/models/Database.js`)

**New Properties:**
- `archivedJobs: Map` - Stores archived jobs

**New Methods:**
```javascript
// Archive a job explicitly
await database.archiveJob(id);

// Restore an archived job
await database.restoreJob(id);
```

**Changed Behavior:**
```javascript
// deleteJob now archives instead of deletes
await database.deleteJob(id);
// Equivalent to: await database.archiveJob(id);
```

### 3. Payment Manager (`src/freelance/paymentManager.js`)

**New Properties:**
- `completedPayments: Map` - Stores completed/cancelled payments

**Changed Behavior:**
```javascript
// All completed payments are now archived
paymentManager.completePayout(payoutId);
// → Archived to completedPayments with type: 'payout'

paymentManager.confirmPayment(transactionId);
// → Archived to completedPayments with type: 'payment'

paymentManager.cancelPayment(transactionId);
// → Archived to completedPayments with type: 'cancelled_payment'
```

### 4. AI Orchestrator (`src/freelance/ai/orchestrator.js`)

**New Properties:**
- `completedJobs: Map` - Stores completed/failed/cancelled AI jobs

**Changed Behavior:**
```javascript
// All AI jobs are archived on completion
orchestrator.executeTask(task);
// → On completion/failure, archived to completedJobs

orchestrator.cancelTask(taskId);
// → Cancelled task archived to completedJobs
```

### 5. Bot.js Core Logic

**New Properties:**
- `archivedPayments: Set` - Old payment IDs
- `archivedCache: Map` - Expired cache entries
- `archivedTasks: Map` - Completed tasks

**Changed Behavior:**
```javascript
// Payments archived when queue exceeds 1000
// Cache entries archived after TTL expires
// Tasks archived after 24h if completed
```

## Migration Steps

### Step 1: Update Your Code (Optional)

If you're using the legacy delete methods, you can continue using them (they'll work with deprecation warnings), or update to the new explicit archival methods:

```javascript
// Option 1: Continue using delete (works, but logs warning)
webhookManager.deleteWebhook(id);

// Option 2: Update to explicit archival (recommended)
webhookManager.archiveWebhook(id);
```

### Step 2: Handle Archived Data

If you were expecting deleted items to be gone, update your logic:

```javascript
// Before: This would return null for deleted webhooks
const webhook = webhookManager.getWebhook(id);

// After: This might return an archived webhook
const webhook = webhookManager.getWebhook(id);
if (webhook && webhook.status === 'archived') {
  // Handle archived webhook
  console.log('Webhook is archived:', webhook.archived_at);
}
```

### Step 3: Use Restore Functionality

Take advantage of the new restore capability:

```javascript
// Restore an archived webhook
const restored = webhookManager.restoreWebhook(webhookId);
if (restored) {
  console.log('Webhook restored successfully');
}

// Restore an archived job
const jobRestored = await database.restoreJob(jobId);
if (jobRestored) {
  console.log('Job restored successfully');
}
```

### Step 4: Query Archived Data

Access historical data for analytics:

```javascript
// Access archived webhooks
for (const [id, webhook] of webhookManager.archivedWebhooks) {
  console.log(`Archived webhook: ${id}`, webhook.archived_at);
}

// Access archived jobs
for (const [id, job] of database.archivedJobs) {
  console.log(`Archived job: ${id}`, job.archived_at);
}

// Access completed payments
for (const [id, payment] of paymentManager.completedPayments) {
  console.log(`Payment: ${id}`, payment.type, payment.status);
}
```

## Archived Item Structure

All archived items include metadata:

```javascript
{
  // Original item properties
  id: "webhook_123",
  url: "https://example.com/hook",
  events: ["order.placed"],
  
  // Archive metadata
  archived_at: "2026-01-15T11:28:39.309Z",
  status: "archived",
  
  // Optional metadata
  type: "payout", // For payments
  finalStatus: "completed", // For AI jobs
  archivedReason: "completed_and_expired" // For tasks
}
```

## Best Practices

### 1. Check for Archived Status

```javascript
const item = manager.get(id);
if (item && item.status !== 'archived') {
  // Only work with active items
}
```

### 2. Periodic Archive Cleanup

Consider implementing periodic cleanup of very old archives:

```javascript
// Example: Archive items older than 1 year
function cleanupOldArchives() {
  const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
  
  for (const [id, item] of manager.archivedItems) {
    const archivedTime = new Date(item.archived_at).getTime();
    if (archivedTime < oneYearAgo) {
      // Consider permanent deletion or backup to external storage
      console.log(`Archive older than 1 year: ${id}`);
    }
  }
}
```

### 3. Export Archives for Backup

```javascript
// Export archived data for external backup
function exportArchives() {
  return {
    webhooks: Array.from(webhookManager.archivedWebhooks.entries()),
    jobs: Array.from(database.archivedJobs.entries()),
    payments: Array.from(paymentManager.completedPayments.entries()),
    aiJobs: Array.from(orchestrator.completedJobs.entries()),
    exportedAt: new Date().toISOString()
  };
}

// Usage
const archives = exportArchives();
fs.writeFileSync('archives.json', JSON.stringify(archives, null, 2));
```

### 4. Analytics and Reporting

```javascript
// Generate analytics from archived data
function generateArchiveReport() {
  const webhooksArchived = webhookManager.archivedWebhooks.size;
  const jobsArchived = database.archivedJobs.size;
  const paymentsCompleted = paymentManager.completedPayments.size;
  
  return {
    webhooksArchived,
    jobsArchived,
    paymentsCompleted,
    totalArchived: webhooksArchived + jobsArchived + paymentsCompleted,
    reportedAt: new Date().toISOString()
  };
}
```

## Testing Your Migration

### Unit Tests

Update your tests to verify archival behavior:

```javascript
test('should archive webhook instead of deleting', () => {
  const id = webhookManager.registerWebhook({
    url: 'https://example.com',
    events: ['test']
  }).id;
  
  // Archive the webhook
  webhookManager.deleteWebhook(id);
  
  // Verify it's archived, not gone
  const webhook = webhookManager.getWebhook(id);
  expect(webhook).not.toBeNull();
  expect(webhook.status).toBe('archived');
  expect(webhook.archived_at).toBeDefined();
});

test('should restore archived webhook', () => {
  const id = webhookManager.registerWebhook({
    url: 'https://example.com',
    events: ['test']
  }).id;
  
  // Archive and restore
  webhookManager.archiveWebhook(id);
  const restored = webhookManager.restoreWebhook(id);
  
  // Verify restoration
  expect(restored).toBe(true);
  const webhook = webhookManager.getWebhook(id);
  expect(webhook.status).not.toBe('archived');
});
```

### Integration Tests

Test the full workflow:

```javascript
test('should maintain audit trail through lifecycle', async () => {
  // Create
  const job = await database.createJob({
    platform: 'test',
    title: 'Test Job'
  });
  
  // Update
  await database.updateJob(job.id, { status: 'completed' });
  
  // Archive
  await database.archiveJob(job.id);
  
  // Verify archived
  const archivedJob = await database.getJob(job.id);
  expect(archivedJob.status).toBe('archived');
  expect(archivedJob.archived_at).toBeDefined();
  
  // Restore
  await database.restoreJob(job.id);
  
  // Verify restored
  const restoredJob = await database.getJob(job.id);
  expect(restoredJob.status).not.toBe('archived');
});
```

## Rollback Plan

If you need to temporarily disable archival (not recommended):

```javascript
// Quick workaround: Override archive methods (NOT RECOMMENDED)
webhookManager.archiveWebhook = function(id) {
  return this.webhooks.delete(id);
};

// Better approach: Use a feature flag
if (config.enableArchival) {
  manager.archiveWebhook(id);
} else {
  manager.webhooks.delete(id);
}
```

## FAQ

### Q: Will this impact performance?

**A:** Minimal impact. Archives use separate Map structures, so active data lookup is unaffected. Memory usage increases proportionally to archived items, but this can be managed with periodic cleanup.

### Q: Can I still use the old delete methods?

**A:** Yes! They now call archival methods internally and log deprecation warnings. Your existing code will continue to work.

### Q: How do I permanently delete something?

**A:** The system is designed to avoid permanent deletion. If absolutely necessary, you can manually delete from the archive:

```javascript
webhookManager.archivedWebhooks.delete(id); // Permanent deletion
```

### Q: What happens to archives on server restart?

**A:** Current implementation uses in-memory Maps. Archives are lost on restart. For production, consider:
- Persisting archives to database
- Exporting archives to files periodically
- Using external storage (S3, etc.)

### Q: How do I query all items (active + archived)?

**A:** Combine both collections:

```javascript
const allWebhooks = [
  ...webhookManager.webhooks.values(),
  ...webhookManager.archivedWebhooks.values()
];
```

## Support

For questions or issues:
- Check [CHANGELOG.md](CHANGELOG.md) v2.2.0 section
- Review [GitHub Issues](https://github.com/oconnorw225-del/ndax-quantum-engine/issues)
- Contact maintainers

## Version History

- **v2.2.0** (2026-01-15): Initial archival system implementation
  - All deletion operations converted to archival
  - Restore functionality added
  - Comprehensive metadata tracking
  - Backward compatible with deprecation warnings
