# 01-financial-system

# comand build to render

corepack enable && corepack prepare yarn@4.11.0 --activate && yarn install --immutable && npx prisma generate && yarn build && yarn migrate

"scripts": {
"dev": "dotenv -e .env.local -- tsx watch src/server.ts",
"prod": "dotenv -e .env -- tsx watch src/server.ts",
"build": "tsc",
"start": "node dist/src/server.js",
"migrate:dev": "dotenv -e .env.local -- prisma migrate deploy",
"migrate:prod": "dotenv -e .env -- prisma migrate deploy"
},

config do codigo da balanca

PP + CCCCC + WWWWW + D
22 + 54321 + 00750 + X
