sudo npm install -g pnpm
rm -f package-lock.json
pnpm install
pnpm run bootstrap
pnpm run deploy
echo DONE.
