import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';

export default defineConfig({
    plugins: [
        react(),  // ensures all necessary React and JSX processing
        viteTsconfigPaths(),
        svgrPlugin()
    ],
    server: {
        open: true,
        port: 3000,
    },
});
