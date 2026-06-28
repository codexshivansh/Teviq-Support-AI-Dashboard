export const demoConversations = [
  {
    id: "conv_1001",
    customer: "Aarav Sharma",
    customerId: "guest_123",
    brandId: "urban-demo",
    lastMessage: "Track order UG-SH-7001",
    intent: "order_tracking",
    status: "resolved",
    channel: "website",
    timestamp: "2026-06-28T09:40:00+05:30",
    messages: [
      { role: "customer", text: "Track order UG-SH-7001" },
      { role: "assistant", text: "Order UG-SH-7001 is currently Out for Delivery. Delivery is expected today." }
    ]
  },
  {
    id: "conv_1002",
    customer: "Meera Iyer",
    customerId: "guest_456",
    brandId: "vastra-demo",
    lastMessage: "Can I exchange size for my kurta?",
    intent: "return_exchange",
    status: "open",
    channel: "website",
    timestamp: "2026-06-28T10:05:00+05:30",
    messages: [
      { role: "customer", text: "Can I exchange size for my kurta?" },
      { role: "assistant", text: "Please share your order ID so I can check exchange eligibility." }
    ]
  },
  {
    id: "conv_1003",
    customer: "Riya Kapoor",
    customerId: "guest_789",
    brandId: "beauty-demo",
    lastMessage: "This serum caused allergy, call me",
    intent: "complaint",
    status: "escalated",
    channel: "whatsapp demo",
    timestamp: "2026-06-28T10:22:00+05:30",
    messages: [
      { role: "customer", text: "This serum caused allergy, call me" },
      { role: "assistant", text: "I am routing this to a human support manager. Please share your phone/email." }
    ]
  },
  {
    id: "conv_1004",
    customer: "Kabir Sethi",
    customerId: "guest_321",
    brandId: "urban-demo",
    lastMessage: "Suggest earbuds for calls",
    intent: "product_recommendation",
    status: "resolved",
    channel: "website",
    timestamp: "2026-06-28T11:12:00+05:30",
    messages: [
      { role: "customer", text: "Suggest earbuds for calls" },
      { role: "assistant", text: "SwiftBuds Pro is best for calls, music and everyday wireless use." }
    ]
  },
  {
    id: "conv_1005",
    customer: "Naina Bose",
    customerId: "guest_654",
    brandId: "vastra-demo",
    lastMessage: "Do you support COD?",
    intent: "payment_cod",
    status: "resolved",
    channel: "website",
    timestamp: "2026-06-28T12:04:00+05:30",
    messages: [
      { role: "customer", text: "Do you support COD?" },
      { role: "assistant", text: "COD is available on selected pincodes as per brand policy." }
    ]
  },
  {
    id: "conv_1006",
    customer: "Dev Malhotra",
    customerId: "guest_777",
    brandId: "beauty-demo",
    lastMessage: "Which product is good for dry skin?",
    intent: "product_recommendation",
    status: "open",
    channel: "whatsapp demo",
    timestamp: "2026-06-28T12:31:00+05:30",
    messages: [
      { role: "customer", text: "Which product is good for dry skin?" },
      { role: "assistant", text: "Barrier Repair Moisturizer is best for dry and sensitive skin." }
    ]
  }
];
