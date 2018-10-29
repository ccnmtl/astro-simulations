NODE_MODULES ?= ./node_modules
JS_SENTINAL ?= $(NODE_MODULES)/sentinal

$(JS_SENTINAL): package.json
	rm -rf $(NODE_MODULES) package-lock.json
	npm install
	touch $(JS_SENTINAL)

eslint: $(JS_SENTINAL)
	npm run eslint

test: $(JS_SENTINAL)
	npm run test

dev: $(JS_SENTINAL)
	./node_modules/.bin/webpack --mode development --watch

build: $(JS_SENTINAL)
	./node_modules/.bin/webpack --mode production

clean:
	rm -rf $(NODE_MODULES) dist/*.js

.PHONY: clean
