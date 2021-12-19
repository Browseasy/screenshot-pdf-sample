import genericPool = require('generic-pool')
import puppeteer from 'puppeteer-core';

import {
    BROWSEASY_CONNECTION_STRING,
    BROWSER_POOL_EVICTION_INTERVAL,
    MAX_BROWSER_PER_WORKER,
    BROWSER_POOL_MAX_ACQUIRE_REQUEST_PER_WORKER,
    MIN_BROWSER_PER_WORKER
} from '../config';

export const createBrowserPool = () => {
    const browserPool = genericPool.createPool<puppeteer.Browser | undefined>(
        {
            create: async () => {
                return await puppeteer.connect({
                    browserWSEndpoint: BROWSEASY_CONNECTION_STRING,
                    // Always set to null
                    defaultViewport: null
                });
            },
            destroy: async (browser: puppeteer.Browser) => {
                return browser.disconnect();
            },
            validate: async (browser: puppeteer.Browser) => {
                console.log(`Validating browser..`);
                return browser && browser.isConnected();
            }
        },
        {
            max: MAX_BROWSER_PER_WORKER,
            min: MIN_BROWSER_PER_WORKER,
            testOnBorrow: true, // validation
            acquireTimeoutMillis: 10 * 1000, // 10 seconds
            fifo: true, // Oldest browser will be evicted
            autostart: true,
            evictionRunIntervalMillis: BROWSER_POOL_EVICTION_INTERVAL,
            numTestsPerEvictionRun: 1,
            maxWaitingClients: BROWSER_POOL_MAX_ACQUIRE_REQUEST_PER_WORKER,
        }
    );
    browserPool.on('factoryCreateError', function (err: Error) {
        console.log(`Error on factory create`, err.message);
    })

    browserPool.on('factoryDestroyError', function (err) {
        console.log(`Error on factory destroy`, err.message);
    })

    return browserPool;
}