import assert from "node:assert/strict";
import { startConversationPolling } from "../src/services/conversationPolling.js";

globalThis.document = new EventTarget();
document.hidden = false;
globalThis.window = new EventTarget();
let tick;
let cleared = false;
globalThis.setInterval = (callback, delay) => { assert.equal(delay, 15000); tick = callback; return 1; };
globalThis.clearInterval = () => { cleared = true; };
const flush = () => new Promise((resolve) => setImmediate(resolve));
let calls = 0;
let revision = 0;
let done = 0;
let errors = 0;
const received = [];
const requests = [];
const stop = startConversationPolling({
  load: () => { calls++; return new Promise((resolve, reject) => requests.push({ resolve, reject })); },
  onData: (result) => received.push(result),
  onInitialError: () => errors++,
  onInitialComplete: () => done++,
  getRevision: () => revision
});
assert.equal(calls, 1);
requests[0].resolve("initial");
await flush();
assert.deepEqual(received, ["initial"]);
assert.equal(done, 1);

document.hidden = true;
tick();
assert.equal(calls, 1, "hidden tabs should not poll");
document.hidden = false;
document.dispatchEvent(new Event("visibilitychange"));
assert.equal(calls, 2, "returning to the tab should refresh immediately");
tick();
assert.equal(calls, 2, "polls must not overlap");
revision++;
requests[1].resolve("stale before manual send");
await flush();
assert.deepEqual(received, ["initial"], "a response started before a send must not erase the locally appended reply");
assert.equal(calls, 3, "a discarded stale request should trigger a fresh lookup");
requests[2].resolve("fresh");
await flush();
assert.deepEqual(received, ["initial", "fresh"]);

window.dispatchEvent(new Event("focus"));
assert.equal(calls, 4);
requests[3].reject(new Error("background network error"));
await flush();
assert.equal(errors, 0, "background failures should preserve the visible inbox");
assert.equal(done, 1, "background polling must not trigger the initial loading screen");
tick();
assert.equal(calls, 5);
stop();
requests[4].resolve("after unmount or workspace change");
await flush();
assert.deepEqual(received, ["initial", "fresh"]);
assert(cleared);
window.dispatchEvent(new Event("focus"));
assert.equal(calls, 5, "cleanup must remove event handlers");
console.log("PASS inbox polling: periodic/focus/visibility refresh, no overlap, stale-send protection, background error handling and cleanup.");
