cd ./xstar
pnpm install
pnpm build
# 将 /dist 拷贝到 /var/www/xstar/capacitor 中
rm -rf /var/www/xstar/capacitor
mkdir -p /var/www/xstar/capacitor
cp -r ./dist/. /var/www/xstar/capacitor

