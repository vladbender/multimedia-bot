# Multimedia Bot

The bot is created to store information about available features in carsharing cars.

## Run locally

Required software:
1. Docker and Docker Compose
2. Node.js

Running:
1. Place Telegram token [in this config](config.yml) file:
  ```yml
  telegram:
    token: 'place your token here'
  ```
2. Uncomment postgres port mapping [here](docker/docker-compose.yml):
  ```yml
  ports:
    - 5432:5432
  ```

3. Up database:
  ```shell
  docker compose --file=docker/docker-compose.yml --env-file=docker/.env up -d db
  ```

4. Run migrations:
  ```shell
  npm run knex:migrate
  ```

5. Run app:
  ```shell
  npm run dev
  ```

## Deploy

Required software:
1. You need Docker and Docker Compose on remote server
2. You need ssh access to this server

Deploy:
1. Create prod config files:
  - For docker compose: [docker/.env.prod](docker/.env.prod): `cp docker/.env docker/.env.prod`
  - For app: [config.prod.yml](config.prod.yml): `cp config.yml config.prod.yml`

  Don't forget to setup Telegram token, db user and password.

2. Run deploy script
  ```shell
  cd deploy
  ./deploy.sh user@1.1.1.1
  ```
  where `user@1.1.1.1` - username and ip address of the server
