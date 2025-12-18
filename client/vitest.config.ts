import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['src/__tests__/Navbar.test.tsx', 'src/__tests__/ProfilePage.test.tsx'],
  },
});
