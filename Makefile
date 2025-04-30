install:
	mkdir -p vendor && cd vendor && npm init -y && npm install chart.js

startup:
	build_dev install run

build_dev:
	docker build -t weatherapp .

run:
	docker-compose up -d

stop:
	docker-compose down

restart: stop run

logs:
	docker-compose logs -f

ps:
	docker-compose ps
