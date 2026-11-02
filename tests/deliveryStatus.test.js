import test from 'node:test';
import assert from 'node:assert/strict';
import { getDeliveryStatusLabel } from '../src/lib/deliveryStatus.js';

test('maps WhatsApp provider evidence to truthful labels', () => {
  const message = status => ({ providerMessageId: 'wa-id', deliveryStatus: status });
  assert.equal(getDeliveryStatusLabel(message('accepted'), 'whatsapp'), 'Accepted');
  assert.equal(getDeliveryStatusLabel(message('sent'), 'whatsapp'), 'Accepted');
  assert.equal(getDeliveryStatusLabel(message('delivered'), 'whatsapp'), 'Delivered');
  assert.equal(getDeliveryStatusLabel(message('read'), 'whatsapp'), 'Read');
  assert.equal(getDeliveryStatusLabel(message('failed'), 'whatsapp'), 'Failed');
});

test('never invents Instagram delivery and falls back safely', () => {
  const message = status => ({ providerMessageId: 'ig-id', deliveryStatus: status });
  assert.equal(getDeliveryStatusLabel(message('accepted'), 'instagram'), 'Accepted');
  assert.equal(getDeliveryStatusLabel(message('seen'), 'instagram'), 'Seen');
  assert.equal(getDeliveryStatusLabel(message('delivered'), 'instagram'), 'Status uncertain');
  assert.equal(getDeliveryStatusLabel(message('unknown'), 'instagram'), 'Status uncertain');
  assert.equal(getDeliveryStatusLabel({}, 'instagram'), 'Status uncertain');
});
