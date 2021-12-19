# Screenshot & PDF Generator API
This example illustrates using Browseasy with [Puppeteer](https://github.com/puppeteer/puppeteer) to run an HTTP API (Express application) to capture screenshot or pdf from any requested URL. The application takes advantage of [Node.js Cluster API](https://nodejs.org/api/cluster.html) to utilize multi-cores on the machine by running multiple workers per CPU.  

Headless browsers are powerful but expensive resources. Each worker has multiple browsers running on the cloud and managed by a generic resource pool. You can adjust the worker configuration by [configuration](./src/config/index.ts).

## Prerequisites
To run this example, make sure [Node.js](https://nodejs.org/en/) (>=16) is installed in your system.

## Running the example
Note that you need to update your connection string with respect to your plan details in [index.ts](./src/config/index.ts). 
1. Install dependencies
    ```
    $ npm install
    ```
2. Run application
    ```
    $ npm run start
    ```
3. The server is running on http://localhost:8081. 
4. To test a screenshot

    http://localhost:8081/screenshot?url=https://browseasy.com

5. To test a pdf

    http://localhost:8081/pdf?url=https://browseasy.com
