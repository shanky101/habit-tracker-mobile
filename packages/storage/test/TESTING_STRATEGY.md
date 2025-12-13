# Storage Package Testing Strategy

## Overview
The `storage` package manages data persistence, likely using `expo-sqlite` or similar. Testing here focuses on data integrity, correct CRUD operations, and handling migrations.

## Recommended Stack
- **Test Runner:** Jest
- **Mocking:** `jest-expo-sqlite` (or manual mocks for SQLite)

## Testing Scope

### 1. Unit Tests (Logic)
- **Goal:** Verify data transformation and query generation logic.
- **Strategy:** Test helper functions that format data for DB insertion or parse data from DB rows.
- **Action:**
  - Write pure unit tests for utility functions.

### 2. Integration Tests (Mocked DB)
- **Goal:** Verify that the service layer interacts correctly with the database driver.
- **Strategy:** Mock the underlying SQLite module. Assert that the correct SQL queries are generated and executed.
- **Action:**
  - Use `jest.mock` to mock `expo-sqlite`.
  - Check `transaction.executeSql` calls for correct query strings and arguments.

### 3. Schema/Migration Testing
- **Goal:** Ensure database schema is set up correctly and migrations run without error.
- **Strategy:** Simulate migration flows.
- **Action:**
  - Test the logic that versions the DB and applies updates.

## Directory Structure
```
/packages/storage
  /src
    /services
      StorageService.ts
      StorageService.test.ts
    /migrations
      ...
```

## Example Test Spec
```typescript
import { StorageService } from './StorageService';
// Mock the SQLite provider defined in your package
jest.mock('../db/provider'); 

describe('Storage: StorageService', () => {
  it('saves a user preference', async () => {
    const service = new StorageService();
    await service.savePreference('theme', 'dark');
    
    // Assert that the underlying DB execute method was called with:
    // "INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)", ['theme', 'dark']
  });
});
```
