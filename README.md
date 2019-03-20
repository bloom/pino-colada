# pino-colada, Day One Edition 🍹
A cute [ndjson](http://ndjson.org) formatter for [pino](https://github.com/pinojs/pino). 

![pino-colada](./pino-colada.png)

# Usage
Pipe a server that uses pino into pino-colada for logging.

```bash
node server.js | pino-colada
```

# Getting more detail
You can show select headers for each request by setting the environment variable `SHOW_HTTP_HEADERS` to true. Some common and noisy headers, like user-agent, are excluded. Excluded headers can be pretty easily found in the source code.

## License
[MIT](https://tldrlegal.com/license/mit-license)
