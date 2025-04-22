
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './', // Sử dụng đường dẫn tương đối để tài nguyên luôn được tìm thấy
  server: {
    host: "::",
    port: 8080,
    cors: true, // Bật CORS cho development server
    headers: {
      "Access-Control-Allow-Origin": "*", // Cho phép truy cập từ bất kỳ nguồn nào
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    }
  },
  preview: {
    port: 8080,
    cors: true, // Bật CORS cho preview server
    headers: {
      "Access-Control-Allow-Origin": "*", // Cho phép truy cập từ bất kỳ nguồn nào 
    }
  },
  build: {
    outDir: "dist",
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@/components/ui/button', '@/components/ui/toast'] // Specify individual UI components instead of the whole directory
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
