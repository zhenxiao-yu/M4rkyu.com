import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';

export default defineConfig({
    plugins: [
        react({ include: "pathToAllReactFiles.{jsx,tsx}" }),
        viteTsconfigPaths(),
        svgrPlugin(),
    ],
    server: {
        open: true,
        port: 3000,
    },
});
