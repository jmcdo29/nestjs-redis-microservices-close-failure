# Closing Redis Microservice Server Causes Uncaught Error

## Problem

When calling `app.close()` on a redis microservice server, an uncaught error will be thrown.

```
~/node_modules/.pnpm/ioredis@5.2.2/node_modules/ioredis/built/redis/event_handler.js:182
        self.flushQueue(new Error(utils_1.CONNECTION_CLOSED_ERROR_MSG));
                        ^
Error: Connection is closed.
    at close (~/node_modules/.pnpm/ioredis@5.2.2/node_modules/ioredis/built/redis/event_handler.js:182:25)
    at Socket.<anonymous> (~/node_modules/.pnpm/ioredis@5.2.2/node_modules/ioredis/built/redis/event_handler.js:149:20)
    at Object.onceWrapper (node:events:628:26)
    at Socket.emit (node:events:513:28)
    at TCP.<anonymous> (node:net:757:14)
```

## Expected Behavior

The server closes without any kind of errors on SIGINT or `app.close()`. I found this during integration testing of my ogma library where I programatically open and close servers to verify an interceptor works as expected.

## Reproduction Steps

1) clone this repo
2) `npm i`/`yarn`/`pnpm i`
3) `docker compsoe up -d`
4) `npm run start:dev`/`yarn start:dev`/`pnpm start:dev`
5) observe the error

## Possible Solution

The error arises because the server is being clsoed multiple times when `app.close()` is called. It looks like `app.close()` ends up calling `app.dispose()` which calls to the `MicroserviceModule.services.close()` (pseudocode) which doubles the call to the clsoe method. As ioredis has already closed the conenction, this throws an error.

A solution I played around with locally is to create a `protected isClosed` variable on the `server.ts` file in `@nestjs/microservices` and have all of the `server-*.ts` files check for `this.isClosed` before going through the close steps and returning early if it is already closed.
