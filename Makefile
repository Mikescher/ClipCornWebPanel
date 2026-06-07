DOCKER_REPO="registry.blackforestbytes.com"
DOCKER_NAME=mikescher/jclipcorn-webpanel

NAMESPACE=$(shell git rev-parse --abbrev-ref HEAD)

HASH=$(shell git rev-parse HEAD)

run:
	[ -f "/home/mike/temp/jcc-prodcopy/ClipCornDB/ClipCornDB.db" ] && cp "/home/mike/temp/jcc-prodcopy/ClipCornDB/ClipCornDB.db" "/home/mike/Code/private/ClipCorn/ClipCornWebPanel/_run-data/ClipCornDB.db" || true
	export DATABASE_PATH="/home/mike/Code/private/ClipCorn/ClipCornWebPanel/_run-data/ClipCornDB.db" && \
	export PANEL_PASSWORD="test" && \
	. ${HOME}/.nvm/nvm.sh && nvm use && npm i && npm run dev

setup:
	npm install

build:
	npm install
	npm run build:loc

clean:
	rm -rf ./node_modules
	rm -rf ./dist

docker:
	docker build \
	   -t $(DOCKER_NAME):$(HASH) \
	   -t $(DOCKER_NAME):$(NAMESPACE)-latest \
	   -t $(DOCKER_NAME):latest \
	   -t $(DOCKER_REPO)/$(DOCKER_NAME):$(HASH) \
	   -t $(DOCKER_REPO)/$(DOCKER_NAME):$(NAMESPACE)-latest \
	   -t $(DOCKER_REPO)/$(DOCKER_NAME):latest \
	   -f Dockerfile \
	   .

push-docker:
	docker image push $(DOCKER_REPO)/$(DOCKER_NAME):$(HASH)
	docker image push $(DOCKER_REPO)/$(DOCKER_NAME):$(NAMESPACE)-latest
	docker image push $(DOCKER_REPO)/$(DOCKER_NAME):latest

lint:
	. ${HOME}/.nvm/nvm.sh && nvm use && npx eslint .

