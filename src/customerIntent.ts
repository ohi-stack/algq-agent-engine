export type CustomerIntentDefinition = {
  key: string;
  customerNeed: string;
  internalWorkflow: string;
  primaryAction: string;
};

export const CUSTOMER_COMMUNICATION_PRINCIPLE =
  "Communicate from the customer's situation, question, problem, and desired outcome; map to canonical ARE workflows internally.";

export const CUSTOMER_INTENTS: CustomerIntentDefinition[] = [
  {
    key: "property-options",
    customerNeed: "I am not sure what to do with my property.",
    internalWorkflow: "homeowner_options",
    primaryAction: "See My Options",
  },
  {
    key: "property-review",
    customerNeed: "Can someone look at my situation and help me figure out the next step?",
    internalWorkflow: "property_review",
    primaryAction: "Get My Property Reviewed",
  },
  {
    key: "sell-as-is",
    customerNeed: "I need to sell without making repairs first.",
    internalWorkflow: "sell_as_is",
    primaryAction: "See If an As-Is Sale Fits",
  },
  {
    key: "inherited-property",
    customerNeed: "I inherited a house. What do I do now?",
    internalWorkflow: "inherited_property_guidance",
    primaryAction: "Talk Through the Property",
  },
  {
    key: "estate-transition",
    customerNeed: "I am dealing with a property after someone passed away.",
    internalWorkflow: "estate_transition_assistance",
    primaryAction: "Get Property-Side Help",
  },
  {
    key: "downsizing",
    customerNeed: "My house is too much for me now and I want to downsize.",
    internalWorkflow: "downsizing_support",
    primaryAction: "Plan My Next Step",
  },
  {
    key: "future-move",
    customerNeed: "I am not ready to move yet, but I want to start planning.",
    internalWorkflow: "future_move_planning",
    primaryAction: "Start Planning",
  },
  {
    key: "property-stewardship",
    customerNeed: "Who can keep an eye on my property when I cannot be there?",
    internalWorkflow: "property_stewardship",
    primaryAction: "Request Property Support",
  },
  {
    key: "trusted-property-contact",
    customerNeed: "I need someone local who can be my point of contact.",
    internalWorkflow: "trusted_property_contact",
    primaryAction: "Request a Local Property Contact",
  },
  {
    key: "seller-financing",
    customerNeed: "Can I sell and receive payments over time?",
    internalWorkflow: "seller_financing",
    primaryAction: "Review Seller-Financing Options",
  },
  {
    key: "submit-property",
    customerNeed: "I have a property. Would Algonquian consider it?",
    internalWorkflow: "deal_intake",
    primaryAction: "Submit My Property",
  },
  {
    key: "buyer-network",
    customerNeed: "How do I get access to real estate opportunities?",
    internalWorkflow: "buyer_network",
    primaryAction: "Join the Buyer Network",
  },
  {
    key: "private-lender",
    customerNeed: "I have capital to lend on real estate deals.",
    internalWorkflow: "capital_private_lender",
    primaryAction: "Discuss a Lending Relationship",
  },
];

export function findCustomerIntent(key: string): CustomerIntentDefinition | undefined {
  return CUSTOMER_INTENTS.find((intent) => intent.key === key);
}
