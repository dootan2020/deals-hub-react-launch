import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: './', // Add this line to ensure assets are loaded with relative paths
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "dist",
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'vendor-utils': ['date-fns', 'lucide-react', 'class-variance-authority'],
          'admin': [
            '@/pages/admin/AdminDashboard',
            '@/pages/admin/CategoryAdmin',
            '@/pages/admin/OrdersAdmin',
          ],
          'account': [
            '@/pages/user/MyAccountPage',
            '@/pages/DepositHistoryPage',
          ],
          'checkout': [
            '@/pages/CheckoutPage',
            '@/pages/OrderSuccessPage',
          ]
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Add mainFields to help resolve packages correctly
    mainFields: ['browser', 'module', 'jsnext:main', 'jsnext', 'main']
  },
  define: {
    // Add polyfills for Node.js globals
    global: 'globalThis',
    'process.env': {},
  },
}));
