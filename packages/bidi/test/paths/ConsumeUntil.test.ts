import {failure, success} from "@http4t/result";
import chai from "chai";
import {ConsumeUntil} from "@http4t/bidi/paths/ConsumeUntil";

const {expect} = chai;

describe('ConsumeUntil', () => {
    it('returns undefined if consumer returns -1', async () => {
        const cu = new ConsumeUntil({consume: () => -1});
        expect(cu.consume("whatever")).deep.eq(
            failure({message: "path did not match", remaining: "whatever"}));
    });

    it('returns matched path', async () => {
        const cu = new ConsumeUntil({consume: () => 4});
        expect(cu.consume("12345678")).deep.eq(
            success({
                    value: "1234",
                    remaining: "5678"
                }
            ));
    });
});
