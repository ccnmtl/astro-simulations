sims := exoplanet-transit-simulator \
	lunar-phase-simulator \
	small-angle-demo \
	sun-motion-simulator \
	eclipsing-binary-simulator \
	gas-retention-simulator

eslint-all:
	@$(foreach dir, $(sims), cd $(dir) && npm i && npm run eslint && cd ..;)

test-all:
	cd lunar-phase-simulator && npm i && npm run test
	cd sun-motion-simulator && npm i && npm run test

all:
	@$(foreach dir, $(sims), cd $(dir) && npm i && npm run build && cd ..;)

clean:
	@$(foreach dir, $(sims), cd $(dir) && rm -rf node_modules package-lock.json && cd ..;)
