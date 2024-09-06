# Execute sh deploy-static.sh in root directory to upload
#Those items can be modified according to the actual situation, such as build shell、dist directory、projectName parameter, no need to change other item
# pnpm run build
pnpm run build --base=/assets/dex-iframe-test/ --mode=aladdin
cd dist
tar -zcf output.tgz ./*
curl --cookie "upload_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImppYW4ubGl1QG9rZy5jb20iLCJpYXQiOjE3MjI0MTkyNDQsImV4cCI6MTg4MDA5OTI0NH0.xXe5amsJ08SRYA0yAMTIvmW_FspFcsL6P1brjawhHQs" \
https://fe.okg.com/api/upload -F file=@output.tgz -F projectName=dex-iframe-test
rm -f output.tgz
