export function getDeliveryStatusLabel(message, channel) {
  if (!message?.providerMessageId) return 'Status uncertain';
  const status = message.deliveryStatus;
  if (!status || status === 'uncertain') return 'Status uncertain';
  if (status === 'failed') return 'Failed';
  if (status === 'accepted' || status === 'sent') return 'Accepted';
  if (status === 'delivered') return channel === 'instagram' ? 'Status uncertain' : 'Delivered';
  if (status === 'read' || status === 'seen') return channel === 'instagram' ? 'Seen' : 'Read';
  return 'Status uncertain';
}
