FROM oven/bun

COPY bun.lockb . 
COPY package.json . 

RUN bun install --frozen-lockfile

COPY . .

EXPOSE 4000
CMD ["bun", "server/index.ts"]