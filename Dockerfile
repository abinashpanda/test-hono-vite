FROM oven/bun

COPY bun.lock . 
COPY package.json . 

RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
RUN bun run --bun build

EXPOSE 4000

CMD ["bun", "src/server/index.ts"]