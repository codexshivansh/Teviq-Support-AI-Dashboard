import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rememberPurchase } from '../src/services/billingJourney.js';
test('selected plan survives login/onboarding and ignores arbitrary query values', () => {
 const data = new Map(); const store = {setItem:(k,v)=>data.set(k,v),getItem:k=>data.get(k)};
 assert.equal(rememberPurchase('?plan=standard',store),'standard');
 assert.equal(rememberPurchase('',store),'standard');
 assert.equal(rememberPurchase('?plan=free-unlimited',store),'standard');
});
