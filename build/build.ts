import {dependencyOrder} from "./util/graph";
import {packages, Packages} from "./util/packages";
import {spawnPromise} from "./util/processes";

/**
 * For some reason installing other yarn workspaces does not reliably
 * create the `puppet` command in `node_modules/bin`, whereas linking
 * works consistently.
 *
 * yarn v2 workspace: dependencies might fix this.
 */
async function linkMochaPuppeteer(modules: Packages, install: boolean) {
    const mochaPuppeteer = modules["@http4t/mocha-puppeteer"];
    if (install) await spawnPromise("yarn", ["link"], mochaPuppeteer.path)
}

(async function build() {
    const args = process.argv.slice(2);
    const install = args[0] === 'install';

    const modules = {
        ...packages("packages"),
        ...packages("examples")
    };

    if (install) await linkMochaPuppeteer(modules, install);

    for (const name of dependencyOrder(modules)) {
        const module = modules[name];
        console.log(name);
        console.log(module.path);
        const cwd = module.path;

        if (install) {
            await spawnPromise("yarn", ["install"], cwd);

            // See linkMochaPuppeteer
            if (module.package.devDependencies["@http4/mocha-puppeteer"]
                || module.package.dependencies["@http4t/mocha-puppeteer"]) {
                await spawnPromise("yarn", ["link", "@http4t/mocha-puppeteer"], cwd);
            }
        }

        await spawnPromise("yarn", ["build"], cwd);
    }
})().then(_result => {
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
