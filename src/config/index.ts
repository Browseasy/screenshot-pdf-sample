// Check your API key and web socket endpoint from 
// My Products (https://browseasy.com/products/) page.

// Assuming that it's stored in the environment variables, 
// e.g. wss://freemium.browseasy.com
export const BROWSEASY_ENDPOINT = process.env.BROWSEASY_ENDPOINT;

// Assuming that it's stored in the environment variables
// e.g. ccc70169f82f4c7c8a33ecca21c1becf
export const BROWSEASY_API_KEY = process.env.BROWSEASY_API_KEY;

// Your unique connection string.
export const BROWSEASY_CONNECTION_STRING = `${BROWSEASY_ENDPOINT}?code=${BROWSEASY_API_KEY}`;

// Maximum number of browsers per worker process
export const MAX_BROWSER_PER_WORKER = 4;

// Minimum number of browsers per worker process
export const MIN_BROWSER_PER_WORKER = 2;

// HTTP timeout for express server
export const HTTP_TIMEOUT = 10 * 1000; // 10 seconds

// Maximum number of concurrent requests per worker
export const BROWSER_POOL_MAX_ACQUIRE_REQUEST_PER_WORKER = 10;

// Interval for browser pool idle evictions
// Idle timeout on Browseasy side is 2 minutes, meaning that if the browser
// does not receive any inputs then the connection is closed. 
export const BROWSER_POOL_EVICTION_INTERVAL = 30 * 1000; // 30 seconds

// Number of tests to check if the resource is idle per eviction run
export const BROWSER_POOL_NUMBER_OF_TESTS_PER_EVICTION = 1;

