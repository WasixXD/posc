from denoland/deno:2.4.5
workdir /app


copy . .
run deno cache main.ts
expose 8000



cmd ["deno", "-A", "main.ts"]