/**
 * Tests for Backup Service logic
 * Pure function tests — no DB or storage required
 */

// ── Backup metadata helpers ───────────────────────────────────────────────

interface BackupMeta {
  id: string;
  type: 'full' | 'incremental' | 'data_only';
  sizeBytes: number;
  createdAt: Date;
  status: 'pending' | 'completed' | 'failed';
}

function formatBackupSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getLatestBackup(backups: BackupMeta[]): BackupMeta | null {
  if (!backups.length) return null;
  const completed = backups.filter(b => b.status === 'completed');
  if (!completed.length) return null;
  return completed.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
}

function shouldCreateBackup(lastBackupDate: Date | null, frequencyHours: number): boolean {
  if (!lastBackupDate) return true;
  const hoursSince = (Date.now() - lastBackupDate.getTime()) / (1000 * 60 * 60);
  return hoursSince >= frequencyHours;
}

function getBackupRetentionStatus(backups: BackupMeta[], maxCount: number): {
  toDelete: BackupMeta[];
  toKeep: BackupMeta[];
} {
  const sorted = [...backups].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return {
    toKeep: sorted.slice(0, maxCount),
    toDelete: sorted.slice(maxCount),
  };
}

function calcTotalStorageUsed(backups: BackupMeta[]): number {
  return backups.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.sizeBytes, 0);
}

const now = new Date();
const SAMPLE_BACKUPS: BackupMeta[] = [
  { id: '1', type: 'full', sizeBytes: 5 * 1024 * 1024, createdAt: new Date(now.getTime() - 3 * 24 * 3600000), status: 'completed' },
  { id: '2', type: 'incremental', sizeBytes: 512 * 1024, createdAt: new Date(now.getTime() - 2 * 24 * 3600000), status: 'completed' },
  { id: '3', type: 'incremental', sizeBytes: 768 * 1024, createdAt: new Date(now.getTime() - 1 * 24 * 3600000), status: 'completed' },
  { id: '4', type: 'incremental', sizeBytes: 256 * 1024, createdAt: now, status: 'pending' },
  { id: '5', type: 'full', sizeBytes: 0, createdAt: new Date(now.getTime() - 5 * 24 * 3600000), status: 'failed' },
];

describe('Backup — Size Formatting', () => {
  it('formats bytes correctly', () => {
    expect(formatBackupSize(500)).toBe('500 B');
  });

  it('formats kilobytes correctly', () => {
    expect(formatBackupSize(2048)).toBe('2.0 KB');
  });

  it('formats megabytes correctly', () => {
    expect(formatBackupSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('formats gigabytes correctly', () => {
    expect(formatBackupSize(2.5 * 1024 * 1024 * 1024)).toBe('2.50 GB');
  });
});

describe('Backup — Latest Backup Detection', () => {
  it('returns null when no backups', () => {
    expect(getLatestBackup([])).toBeNull();
  });

  it('returns null when all backups failed or pending', () => {
    const noCompleted = SAMPLE_BACKUPS.filter(b => b.status !== 'completed');
    expect(getLatestBackup(noCompleted)).toBeNull();
  });

  it('returns most recent completed backup', () => {
    const latest = getLatestBackup(SAMPLE_BACKUPS);
    expect(latest?.id).toBe('3'); // most recent completed is id 3
  });

  it('ignores failed backups', () => {
    const withFailed: BackupMeta[] = [
      { id: 'a', type: 'full', sizeBytes: 1000, createdAt: new Date(now.getTime() - 1000), status: 'failed' },
      { id: 'b', type: 'full', sizeBytes: 2000, createdAt: new Date(now.getTime() - 2000), status: 'completed' },
    ];
    expect(getLatestBackup(withFailed)?.id).toBe('b');
  });
});

describe('Backup — Schedule Check', () => {
  it('returns true when no backup has ever been created', () => {
    expect(shouldCreateBackup(null, 24)).toBe(true);
  });

  it('returns true when last backup exceeds frequency', () => {
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 3600000);
    expect(shouldCreateBackup(twoDaysAgo, 24)).toBe(true);
  });

  it('returns false when last backup is recent', () => {
    const twoHoursAgo = new Date(now.getTime() - 2 * 3600000);
    expect(shouldCreateBackup(twoHoursAgo, 24)).toBe(false);
  });

  it('returns true at exact frequency boundary', () => {
    const exactly24hAgo = new Date(now.getTime() - 24 * 3600000);
    expect(shouldCreateBackup(exactly24hAgo, 24)).toBe(true);
  });
});

describe('Backup — Retention Policy', () => {
  it('keeps the N most recent backups', () => {
    const result = getBackupRetentionStatus(SAMPLE_BACKUPS, 3);
    expect(result.toKeep).toHaveLength(3);
    expect(result.toDelete).toHaveLength(2);
  });

  it('marks oldest backups for deletion', () => {
    const result = getBackupRetentionStatus(SAMPLE_BACKUPS, 3);
    const deleteIds = result.toDelete.map(b => b.id);
    // oldest are the first two (5 days ago and 3 days ago)
    expect(deleteIds).toContain('5');
    expect(deleteIds).toContain('1');
  });

  it('keeps all backups when maxCount >= total', () => {
    const result = getBackupRetentionStatus(SAMPLE_BACKUPS, 10);
    expect(result.toDelete).toHaveLength(0);
    expect(result.toKeep).toHaveLength(5);
  });

  it('handles empty backup list', () => {
    const result = getBackupRetentionStatus([], 5);
    expect(result.toKeep).toHaveLength(0);
    expect(result.toDelete).toHaveLength(0);
  });
});

describe('Backup — Storage Usage', () => {
  it('calculates total storage for completed backups only', () => {
    const total = calcTotalStorageUsed(SAMPLE_BACKUPS);
    // 5MB + 512KB + 768KB = 5 * 1024 * 1024 + 512 * 1024 + 768 * 1024
    const expected = 5 * 1024 * 1024 + 512 * 1024 + 768 * 1024;
    expect(total).toBe(expected);
  });

  it('returns 0 for empty list', () => {
    expect(calcTotalStorageUsed([])).toBe(0);
  });

  it('ignores pending and failed backups', () => {
    const onlyFailed: BackupMeta[] = [
      { id: 'x', type: 'full', sizeBytes: 999999, createdAt: now, status: 'failed' },
    ];
    expect(calcTotalStorageUsed(onlyFailed)).toBe(0);
  });
});
