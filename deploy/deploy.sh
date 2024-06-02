
set -e -u -o pipefail

SERVER=$1

PROJECT_PATH=$(realpath ..)
PROJECT_DIR=$(basename $PROJECT_PATH)

rm -rf ../dst ../node_modules

echo "Copy files to remote server..."
scp -r -q $PROJECT_PATH $SERVER:/home/

# scp копирует папку под ее исходным именем, поэтому переименовываем
ssh $SERVER "mv /home/$PROJECT_DIR /home/multimedia_bot"

echo "Run app restart..."
ssh $SERVER '/home/multimedia_bot/deploy/restart.sh'

# TODO независимо от кода завершения рестарта чистить файлы

echo "Delete files after deploy..."
ssh $SERVER 'rm -r /home/multimedia_bot'

echo "Done!"