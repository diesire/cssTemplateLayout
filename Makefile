SRC = src/templateLayout.js src/templateLayout.compiler.js src/templateLayout.generator.js

build: $(SRC)
	cat $^ > build/tl.js

docs:
	java -jar lib/jsdoc-toolkit/jsrun.jar lib/jsdoc-toolkit/app/run.js -a -p -t=lib/jsdoc-toolkit/templates/jsdoc -d=doc/ src/

all: build docs
