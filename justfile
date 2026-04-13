dev:
    bun dev

build:
    bun run build

install:
    bun i

unistall:
    rm -rf ./node_modules

reinstall: unistall install

clear-optimitized-deps:
    rm -rf ./node_modules/.vite/deps
