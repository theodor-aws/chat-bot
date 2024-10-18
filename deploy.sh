sudo npm install -g pnpm
rm -f package-lock.json
pip install orjson -t ./lib/playground/functions/api-handler
pnpm install
pnpm run bootstrap
pnpm run deploy
echo DONE.
