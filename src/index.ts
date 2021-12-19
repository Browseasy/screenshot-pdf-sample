import os from 'os';
import cluster from 'cluster';
import express, { Router, Request, Response } from 'express';

import exitHook = require('exit-hook');
import { createBrowserPool } from './pool';
import { HTTP_TIMEOUT } from './config';

if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers based on the number of cpu cores.
    for (let i = 0; i < os.cpus().length; i++) {
        const worker = cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died..`);
    });
} else {
    console.log(`Initializing worker ${process.pid}.`);

    // Let's create a browser pool per worker
    const browserPool = createBrowserPool();

    // Let's create an express per worker
    const app = express();
    const router = Router();
    app.use(router);

    // Health check 
    // e.g. http://localhost:8081
    router.get('/', function (_req: Request, res: Response) {
        res.status(200).send(`Worker ${process.pid} is up and running.
        There are ${browserPool.available} available browsers in the pool.
        ${browserPool.borrowed} browser(s) already borrowed from the pool.`);
    });

    // Screenshot 
    // e.g. http://localhost:8081/screenshot?url=https://browseasy.com
    router.get('/screenshot', async function (req: Request, res: Response) {
        try {
            // Borrow a browser from the pool
            const browser = await browserPool.acquire();

            if (!browser) {
                throw Error(`Unable to acquire browser from the pool..`);
            }

            if (!req.query || !req.query.url) {
                throw Error(`Missing query parameters..`);
            }

            const page = await browser.newPage();

            await page.goto(req.query.url.toString());
            const data = await page?.screenshot({ encoding: 'binary', fullPage: true }) as Buffer;
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': data.length
            }).end(data);

            await page.close();
            // Acquire a browser from the pool
            await browserPool.release(browser);
        }
        catch (err) {
            console.error(err);
            res.status(500).send(`Unable to capture screenshot..`);
        }
    });

    // PDF
    // e.g. http://localhost:8081/pdf?url=https://browseasy.com
    router.get('/pdf', async function (req: Request, res: Response) {
        try {
            // Borrow a browser from the pool
            const browser = await browserPool.acquire();
            if (!browser) {
                throw Error(`Unable to acquire browser from the pool..`);
            }

            if (!req.query || !req.query.url) {
                throw Error(`Missing query parameters..`);
            }

            const page = await browser.newPage();

            await page.goto(req.query.url.toString());

            // await page.emulateMediaType('screen');

            const data = await page.pdf({
                format: 'a3',
                landscape: true
            }) as Buffer;
            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Length': data.length
            }).end(data);

            await page.close();

            // Acquire a browser from the pool
            await browserPool.release(browser);
        }
        catch (err) {
            console.error(err);
            res.status(500).send(`Unable to capture screenshot..`);
        }
    });
    const server = app.listen(8081);

    server.timeout = HTTP_TIMEOUT; // 10 sec timeout

    console.log(`Worker ${process.pid} started..`);

    exitHook(() => {
        console.log(`Exit received on worker..`)

        // Initiate graceful close of any connections to server
        if (server && server.listening) {
            server.removeAllListeners();
            // TODO: Track and close connections gracefully.
            server.close();
        }

        browserPool.removeAllListeners();

        // Draing browser pool
        browserPool.drain()
            .then(() => {
                return browserPool.clear()
            })
    });
}
