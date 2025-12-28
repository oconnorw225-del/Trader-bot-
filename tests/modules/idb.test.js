/**
 * IndexedDB Utilities Tests
 * Tests for IndexedDB wrapper and utilities
 */

import { IDBManager } from '../../src/utils/idb.js';

// Skip IndexedDB tests in Node.js environment since IndexedDB is browser-only
const describeIfBrowser = typeof window !== 'undefined' ? describe : describe.skip;

describeIfBrowser('IndexedDB Manager', () => {
  let idb;
  const dbName = 'test-db';
  const storeName = 'test-store';

  beforeEach(async () => {
    idb = new IDBManager(dbName, storeName);
    await idb.init();
  });

  afterEach(async () => {
    await idb.clear();
    await idb.deleteDatabase();
  });

  describe('Initialization', () => {
    test('should initialize database', async () => {
      expect(idb.isInitialized()).toBe(true);
    });

    test('should create object store', async () => {
      const db = idb.getDatabase();
      expect(db.objectStoreNames.contains(storeName)).toBe(true);
    });

    test('should handle reinitialization', async () => {
      await idb.init();
      expect(idb.isInitialized()).toBe(true);
    });
  });

  describe('CRUD Operations', () => {
    test('should add item to store', async () => {
      const item = { id: 1, name: 'Test Item', value: 100 };
      await idb.add(item);
      
      const retrieved = await idb.get(1);
      expect(retrieved).toEqual(item);
    });

    test('should get item from store', async () => {
      const item = { id: 2, name: 'Test Item 2', value: 200 };
      await idb.add(item);
      
      const retrieved = await idb.get(2);
      expect(retrieved.name).toBe('Test Item 2');
      expect(retrieved.value).toBe(200);
    });

    test('should update item in store', async () => {
      const item = { id: 3, name: 'Original', value: 300 };
      await idb.add(item);
      
      const updated = { id: 3, name: 'Updated', value: 350 };
      await idb.put(updated);
      
      const retrieved = await idb.get(3);
      expect(retrieved.name).toBe('Updated');
      expect(retrieved.value).toBe(350);
    });

    test('should delete item from store', async () => {
      const item = { id: 4, name: 'To Delete', value: 400 };
      await idb.add(item);
      
      await idb.delete(4);
      
      const retrieved = await idb.get(4);
      expect(retrieved).toBeUndefined();
    });

    test('should get all items from store', async () => {
      await idb.add({ id: 5, name: 'Item 5' });
      await idb.add({ id: 6, name: 'Item 6' });
      await idb.add({ id: 7, name: 'Item 7' });
      
      const all = await idb.getAll();
      expect(all.length).toBeGreaterThanOrEqual(3);
      expect(all.some(item => item.id === 5)).toBe(true);
      expect(all.some(item => item.id === 6)).toBe(true);
      expect(all.some(item => item.id === 7)).toBe(true);
    });

    test('should clear all items from store', async () => {
      await idb.add({ id: 8, name: 'Item 8' });
      await idb.add({ id: 9, name: 'Item 9' });
      
      await idb.clear();
      
      const all = await idb.getAll();
      expect(all.length).toBe(0);
    });
  });

  describe('Query Operations', () => {
    test('should count items in store', async () => {
      await idb.add({ id: 10, name: 'Item 10' });
      await idb.add({ id: 11, name: 'Item 11' });
      
      const count = await idb.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('should get items by index', async () => {
      await idb.add({ id: 12, name: 'Item 12', category: 'A' });
      await idb.add({ id: 13, name: 'Item 13', category: 'A' });
      await idb.add({ id: 14, name: 'Item 14', category: 'B' });
      
      // Assuming index on 'category' field
      const items = await idb.getAllByIndex('category', 'A');
      expect(items.length).toBeGreaterThanOrEqual(2);
    });

    test('should get keys from store', async () => {
      await idb.add({ id: 15, name: 'Item 15' });
      await idb.add({ id: 16, name: 'Item 16' });
      
      const keys = await idb.getAllKeys();
      expect(keys).toContain(15);
      expect(keys).toContain(16);
    });
  });

  describe('Transaction Handling', () => {
    test('should execute transaction successfully', async () => {
      await idb.transaction(async (store) => {
        await store.add({ id: 17, name: 'Item 17' });
        await store.add({ id: 18, name: 'Item 18' });
      });
      
      const item17 = await idb.get(17);
      const item18 = await idb.get(18);
      expect(item17).toBeDefined();
      expect(item18).toBeDefined();
    });

    test('should rollback transaction on error', async () => {
      try {
        await idb.transaction(async (store) => {
          await store.add({ id: 19, name: 'Item 19' });
          throw new Error('Transaction error');
        });
      } catch (error) {
        expect(error.message).toBe('Transaction error');
      }
      
      const item19 = await idb.get(19);
      expect(item19).toBeUndefined();
    });
  });

  describe('Bulk Operations', () => {
    test('should add multiple items', async () => {
      const items = [
        { id: 20, name: 'Item 20' },
        { id: 21, name: 'Item 21' },
        { id: 22, name: 'Item 22' }
      ];
      
      await idb.addBulk(items);
      
      const all = await idb.getAll();
      expect(all.length).toBeGreaterThanOrEqual(3);
    });

    test('should update multiple items', async () => {
      await idb.addBulk([
        { id: 23, name: 'Original 23' },
        { id: 24, name: 'Original 24' }
      ]);
      
      await idb.updateBulk([
        { id: 23, name: 'Updated 23' },
        { id: 24, name: 'Updated 24' }
      ]);
      
      const item23 = await idb.get(23);
      const item24 = await idb.get(24);
      expect(item23.name).toBe('Updated 23');
      expect(item24.name).toBe('Updated 24');
    });

    test('should delete multiple items', async () => {
      await idb.addBulk([
        { id: 25, name: 'Item 25' },
        { id: 26, name: 'Item 26' },
        { id: 27, name: 'Item 27' }
      ]);
      
      await idb.deleteBulk([25, 26, 27]);
      
      const item25 = await idb.get(25);
      const item26 = await idb.get(26);
      const item27 = await idb.get(27);
      expect(item25).toBeUndefined();
      expect(item26).toBeUndefined();
      expect(item27).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent key', async () => {
      const item = await idb.get(99999);
      expect(item).toBeUndefined();
    });

    test('should handle duplicate key error', async () => {
      await idb.add({ id: 28, name: 'Item 28' });
      
      await expect(idb.add({ id: 28, name: 'Duplicate' })).rejects.toThrow();
    });

    test('should handle invalid transaction', async () => {
      await expect(idb.transaction(null)).rejects.toThrow();
    });

    test('should handle database not initialized', () => {
      const uninitializedIdb = new IDBManager('new-db', 'new-store');
      expect(() => uninitializedIdb.getDatabase()).toThrow();
    });
  });

  describe('Database Management', () => {
    test('should close database connection', async () => {
      await idb.close();
      expect(idb.isInitialized()).toBe(false);
    });

    test('should delete database', async () => {
      await idb.deleteDatabase();
      expect(idb.isInitialized()).toBe(false);
    });

    test('should reopen closed database', async () => {
      await idb.close();
      await idb.init();
      expect(idb.isInitialized()).toBe(true);
    });
  });

  describe('Version Management', () => {
    test('should upgrade database version', async () => {
      const oldVersion = idb.getVersion();
      await idb.upgradeVersion(oldVersion + 1);
      expect(idb.getVersion()).toBe(oldVersion + 1);
    });

    test('should handle migration on version upgrade', async () => {
      await idb.add({ id: 29, name: 'Item 29' });
      
      await idb.upgradeVersion(2, (db, oldVersion, newVersion) => {
        // Migration logic
        expect(newVersion).toBe(2);
      });
      
      const item = await idb.get(29);
      expect(item).toBeDefined();
    });
  });
});
