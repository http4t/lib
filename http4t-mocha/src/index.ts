#!/usr/bin/env node
'use strict'
import {Browser} from "puppeteer";

const fs = require('fs');
const Puppeteer = require('puppeteer');
const {spawn} = require('child_process');
const {TextDecoder} = require('util');
const decoder = new TextDecoder('utf-8')

function files(dir: string | undefined = undefined): string[] {
    return fs.readdirSync(dir)
        .reduce(
            (acc: string[], f: string) => {
                const fullPath = `${dir}/${f}`;
                return fs.statSync(fullPath).isDirectory()
                    ? [...acc, ...files(fullPath)]
                    : [...acc, fullPath];
            },
            [] as string[]);
}

const testFiles = files(".")
    .filter((f: string) => {
        return f.endsWith("test.ts")
    });

const html = `<!DOCTYPE html>
<html>
<head>
    <title>Mocha Tests</title>
    <meta charset="utf-8">
    <link rel="stylesheet" href="../../node_modules/mocha/mocha.css">
</head>
<body>
<div id="mocha"></div>
<script type="text/javascript" src="../../node_modules/mocha/mocha.js"></script>
<script type="text/javascript">mocha.setup('bdd');</script>
${testFiles.map(f => `<script src="${f}"></script>`).join("\n")}
</body>
</html>`

const htmlFile = `${process.cwd()}/mocha.html`;
fs.writeFileSync(htmlFile, html);
console.log(testFiles);
async function run() {
    const parcel = spawn("parcel", ["serve", "mocha.html"]);
    const parcelStarted = new Promise((resolve, reject) => {
        parcel.on("error", (err: Error) => {
            console.error(err)
            reject(err);
        });
        parcel.stdout.on('data', (data: Buffer) => {
            const text = decoder.decode(data)
            if (text.startsWith("Server running at ")) {
                resolve(null)
            }
            console.log(text);
        });
        parcel.stderr.on('data', (data: any) => {
            const text = decoder.decode(data);
            console.error(text);
            reject(text);
        });
    });
    const browser: Browser = await Puppeteer.launch.bind(Puppeteer)({headless: true});

    try {
        const page = await browser.newPage();
        page.on("console", (message: any) => {
            (async () => {
                const args = await Promise.all(message.args().map((a: any) => a.jsonValue()));
                (console as any)[message.type()](...args);
            })();
        });

        await parcelStarted;
        await page.goto("http://localhost:1234", {waitUntil: 'load', timeout: 20000});

        await page.evaluate(() => {
            return new Promise((resolved: Function, rejected: Function) => {
                mocha
                    .reporter('spec')
                    .run(failures => failures == 0
                        ? resolved("SUCCESS")
                        : rejected("FAILED: " + failures))
            });
        });
    } finally {
        await browser.close();
        parcel.kill();
    }
}

run()
    .then(value => {
        process.exit(0);
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
