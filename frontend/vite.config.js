export default defineConfig({
  plugins: [vue()],
  base: './', // 🔥 DŮLEŽITÉ pro deployment na NGINX
  build: {
    outDir: 'dist' // defaultně je to tak, ale pro jistotu
  },
  server: {
    port: 5173
  }
});
