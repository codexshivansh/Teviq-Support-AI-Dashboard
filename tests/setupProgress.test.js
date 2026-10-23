import test from "node:test";
import assert from "node:assert/strict";
import { getSetupCompletion } from "../src/lib/setupProgress.js";

test("marks AI Live only after prerequisites and explicit live confirmation", () => {
  const ready = {
    knowledge: { stats: { documentCount: 1 } },
    localSetup: { playground: true, install: true, live: true }
  };

  assert.deepEqual(getSetupCompletion(ready), {
    knowledge: true,
    playground: true,
    install: true,
    live: true
  });

  assert.equal(
    getSetupCompletion({
      ...ready,
      localSetup: { playground: true, install: true, live: false }
    }).live,
    false
  );
});

test("marks AI Live only after knowledge, playground, install and explicit live confirmation", () => {
  const completion = getSetupCompletion({
    knowledge: { stats: { documentCount: 1 } },
    localSetup: { playground: true, install: true, live: true }
  });

  assert.equal(completion.live, true);
});
