import { defineConfig } from 'vitest/config';
import os from 'node:os';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    // Isolate tests in a temp SQLite file so they never touch the real DB.
    env: { DB_PATH: path.join(os.tmpdir(), 'sportrental-test.sqlite') },
    testTimeout: 20_000,
  },
});
