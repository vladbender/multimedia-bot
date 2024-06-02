
set -e -u -o pipefail

cd /home/multimedia_bot

DC_FILE=./docker/docker-compose.yml
DC_ENV=./docker/.env.prod

docker compose --file=$DC_FILE --env-file=$DC_ENV build app
docker compose --file=$DC_FILE --env-file=$DC_ENV stop app
docker compose --file=$DC_FILE --env-file=$DC_ENV rm -f app
docker compose --file=$DC_FILE --env-file=$DC_ENV up -d app

# Удаляем старый image
docker image prune -a -f
