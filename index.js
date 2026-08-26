// Keep the app entry local so Expo can start from a git worktree without a
// worktree-local node_modules directory. The router package is still resolved
// by Metro using the dependency paths configured in metro.config.js.
import 'expo-router/entry';
