NODE_MODULES ?= ./node_modules
JS_SENTINAL ?= $(NODE_MODULES)/sentinal

$(JS_SENTINAL): package.json
	rm -rf $(NODE_MODULES)
	npm install
	touch $(JS_SENTINAL)

eslint: $(JS_SENTINAL)
	npm run eslint

test: $(JS_SENTINAL)
	npm run test

babel:
	npx babel --watch src --out-dir js --presets react-app/prod

dev:
	./node_modules/.bin/webpack --mode development --watch

build:
	./node_modules/.bin/webpack --mode production

clean:
	rm -rf $(NODE_MODULES) dist

.PHONY: clean
