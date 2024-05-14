import fs from "fs"
import chai from 'chai';

const {expect} = chai;

function readPreviousContent(fileName: string) {
    try {
        return fs.readFileSync(fileName).toString("utf8");
    } catch (e) {
        return undefined;
    }
}

export function generateTestFile(fileName: string, source: string) {
    const previousContent = readPreviousContent(fileName);

    fs.writeFileSync(fileName, source);

    describe(`Generating ${fileName}`, function () {
        it('should have happened before commit', function () {
            expect(previousContent).eq(source, `${fileName} was not updated before committing`);
        });
    })
}