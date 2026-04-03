# 01-financial-system

# comand build to render

corepack enable && corepack prepare yarn@4.11.0 --activate && yarn install --immutable && npx prisma generate && yarn build && yarn migrate
