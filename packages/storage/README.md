# @app-core/storage

SQLite storage adapter for Zustand state persistence in React Native apps using Expo.

## Features

- **Zustand Integration**: Drop-in replacement for AsyncStorage with SQLite backend
- **Type-safe**: Full TypeScript support
- **Auto-initialization**: Database initialized on first access
- **Error Handling**: Graceful fallbacks for storage errors

## Usage

```typescript
import { createSQLiteStorage } from '@app-core/storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define your repository for database operations
const myRepository = {
  getAll: async () => { /* fetch from SQLite */ },
  syncAll: async (items) => { /* sync to SQLite */ },
  deleteAll: async () => { /* clear SQLite */ },
};

// Create storage adapter
const storage = createSQLiteStorage({
  repository: myRepository,
  initializeDatabase: async () => { /* setup tables */ },
});

// Use with Zustand
const useStore = create(
  persist(
    (set) => ({
      items: [],
      // ... your state
    }),
    {
      name: 'my-store',
      storage,
    }
  )
);
```

## API

### `createSQLiteStorage(config)`

Creates a SQLite storage adapter compatible with Zustand's persist middleware.

**Config**:
- `repository`: Object with `getAll()`, `syncAll()`, and `deleteAll()` methods
- `initializeDatabase`: Async function to initialize database schema

**Returns**: `StateStorage` object for Zustand

## Dependencies

- `expo-sqlite` - SQLite database for React Native
- `zustand` - State management library
