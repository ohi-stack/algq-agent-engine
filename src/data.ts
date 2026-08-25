/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RealEstateDeal, DealStatus, FundingSource, AutomationTrigger, DocTemplate, FolderCategory } from "./types";

export const SEED_DEALS: RealEstateDeal[] = [
  {
    id: "deal-1",
    address: "244 Pine Street",
    city: "Waterbury",
    state: "CT",
    zipCode: "06702",
    propertyType: "Multi-Family",
    ownerName: "Robert Vance",
    ownerPhone: "203-555-0143",
    ownerEmail: "rvance.properties@gmail.com",
    askingPrice: 285000,
    arv: 420000,
    estimatedRepairs: 45000,
    wholesaleFee: 20000,
    mao: 229000, // (420000 * 0.70) - 45000 - 20000 = 294000 - 65000 = 229000
    status: DealStatus.Underwriting,
    occupancy: "Tenant Occupied",
    hasSellerFinancing: true,
    sellerFinancingDetails: {
      downPayment: 30000,
      interestRate: 4.5,
      termMonths: 120,
      monthlyPayment: 2150,
      balloonPayment: 150000
    },
    notes: "Value-add 4-unit property walking distance from Waterbury City Hall. Tenants paying under-market rent. Roof updated 2021. Excellent potential for Algonquian Real Estate income yield.",
    createdAt: "2026-06-10T14:30:00-07:00",
    updatedAt: "2026-06-15T11:00:00-07:00"
  },
  {
    id: "deal-2",
    address: "89 Farmington Avenue",
    city: "Hartford",
    state: "CT",
    zipCode: "06105",
    propertyType: "Commercial",
    ownerName: "Sarah Jenkins & Associates",
    ownerPhone: "860-555-8942",
    ownerEmail: "sjenkins@hartfordcommercial.com",
    askingPrice: 750000,
    arv: 1100000,
    estimatedRepairs: 120000,
    wholesaleFee: 50000,
    mao: 600000, // (1100000 * 0.70) - 120000 - 50000 = 770000 - 170000 = 600000
    status: DealStatus.DueDiligence,
    occupancy: "Vacant",
    hasSellerFinancing: false,
    notes: "Historic mixed-use retail & office building. High road visibility. Needs facade refurbishment and HVAC servicing. Under review for prospective JV equity structure with external family offices.",
    createdAt: "2026-06-12T09:15:00-07:00",
    updatedAt: "2026-06-14T16:45:00-07:00"
  },
  {
    id: "deal-3",
    address: "105 Crown Street",
    city: "New Haven",
    state: "CT",
    zipCode: "06511",
    propertyType: "Single Family",
    ownerName: "Elena Rostova",
    ownerPhone: "203-555-7788",
    ownerEmail: "elena.ros@yahoo.com",
    askingPrice: 320000,
    arv: 490000,
    estimatedRepairs: 60000,
    wholesaleFee: 25000,
    mao: 258000, // (490000 * 0.70) - 60000 - 25000 = 343000 - 85000 = 258000
    status: DealStatus.OfferSubmitted,
    occupancy: "Vacant",
    hasSellerFinancing: true,
    sellerFinancingDetails: {
      downPayment: 40000,
      interestRate: 5.0,
      termMonths: 60,
      monthlyPayment: 1800,
      balloonPayment: 210000
    },
    notes: "Craftsman home walk to Yale Campus. High demand area for graduate housing. Under contract proposed with direct seller terms: $40k down, 5% interest rate, interest-only with 5-year balloon payout.",
    createdAt: "2026-06-08T10:00:00-07:00",
    updatedAt: "2026-06-16T10:30:00-07:00"
  },
  {
    id: "deal-4",
    address: "1429 Fairfield Avenue",
    city: "Bridgeport",
    state: "CT",
    zipCode: "06605",
    propertyType: "Multi-Family",
    ownerName: "Joseph Carbone",
    ownerPhone: "203-555-5231",
    ownerEmail: "jcarbone.realty@gmail.com",
    askingPrice: 380000,
    arv: 560000,
    estimatedRepairs: 75000,
    wholesaleFee: 30000,
    mao: 287000, // (560000 * 0.70) - 75000 - 30000 = 392000 - 105000 = 287000
    status: DealStatus.Funded,
    occupancy: "Tenant Occupied",
    hasSellerFinancing: false,
    notes: "Algonquian RE closed acquisition! 3-flat apartment building. Completed capital raising via Sovereign Family Office GP-LP structure. Yielding 11.2% cash-on-cash with professional management deployed.",
    createdAt: "2026-05-15T08:30:00-07:00",
    updatedAt: "2026-06-11T15:20:00-07:00"
  },
  {
    id: "deal-5",
    address: "58 Grand Street",
    city: "Waterbury",
    state: "CT",
    zipCode: "06702",
    propertyType: "Land",
    ownerName: "Waterbury Industrial Holdings",
    ownerPhone: "203-555-9011",
    ownerEmail: "info@waterburyindustrial.com",
    askingPrice: 145000,
    arv: 250000,
    estimatedRepairs: 20000,
    wholesaleFee: 15000,
    mao: 140000, // (250000 * 0.70) - 20000 - 15000 = 175000 - 35000 = 140000
    status: DealStatus.Intake,
    occupancy: "Vacant",
    hasSellerFinancing: false,
    notes: "0.85 acre empty parcel approved for multi-family residential zoning. Sourced direct-to-owner. Perfect for Algonquian modular architectural development prototyping.",
    createdAt: "2026-06-16T11:00:00-07:00",
    updatedAt: "2026-06-16T11:00:00-07:00"
  }
];

export const SEED_FUNDS: FundingSource[] = [
  {
    id: "fund-1",
    name: "Sovereign Family Office Group",
    type: "Joint Venture Partner",
    contactPerson: "Marcus Vance",
    maxAmount: 2500000,
    targetYield: 9.5,
    status: "Active",
    activeAllocated: 680000,
    notes: "Core funding relationship aligned with Gregory Jones' Sovereign Intelligence frameworks. High liquidity available for multi-family acquisitions in New Haven and Fairfield counties."
  },
  {
    id: "fund-2",
    name: "Nutmeg Private Capital LLC",
    type: "Private Lender",
    contactPerson: "Diane Sterling",
    maxAmount: 1000000,
    targetYield: 11.0,
    status: "Active",
    activeAllocated: 380000,
    notes: "Waterbury-based private mortgage lender. 1st lien position required. Speed-oriented underwriting with 5-day closing capabilities."
  },
  {
    id: "fund-3",
    name: "Gregory Jones Principal Equity",
    type: "Sponsor Equity",
    contactPerson: "Gregory Jones",
    maxAmount: 500000,
    targetYield: 15.0,
    status: "Active",
    activeAllocated: 120000,
    notes: "Founder co-investment capital allocated from Algonquian Real Estate primary treasury to support acquisition deposits and early-stage pre-development costs."
  },
  {
    id: "fund-4",
    name: "Charter Oak Institutional Trust",
    type: "Institutional Debt",
    contactPerson: "Amir Al-Amin",
    maxAmount: 5000000,
    targetYield: 7.2,
    status: "Under Discussion",
    activeAllocated: 0,
    notes: "Commercial credit facility targeting commercial properties with 1.25x+ Debt Service Coverage Ratio (DSCR). Draft contract under final review."
  }
];

export const SEED_AUTOMATIONS: AutomationTrigger[] = [
  {
    id: "auto-1",
    title: "Instant Lead SMS to Gregory Jones",
    event: "ON_DEAL_INTAKE",
    actionType: "SMS Alert",
    recipient: "+1-203-555-0199 (Gregory Jones)",
    subjectTemplate: "ARE Tech Alert: New Deal Drigged",
    bodyTemplate: "Admin Notice: A new deal lead at [Address], [City] has been created in Algonquian Deal Intake. Price: $[AskingPrice]. Primary review initialized.",
    isActive: true
  },
  {
    id: "auto-2",
    title: "Draft LOI upon Underwriting Approval",
    event: "ON_STATUS_CHANGE_UNDERWRITING",
    actionType: "Document Draft",
    recipient: "ARE Tech Doc Processor",
    subjectTemplate: "LOI Draft: [Address]",
    bodyTemplate: "Generate standard Letter of Intent for owner [OwnerName] at $[Mao] reflecting standard 70% ARV limit and target 10% cash-on-cash yield requirements.",
    isActive: true
  },
  {
    id: "auto-3",
    title: "Notify JV Partners of Offer Submitted",
    event: "ON_OFFER_SUBMITTED",
    actionType: "Email Alert",
    recipient: "marcus@sovereigncapital.com, sjenkins@hartfordcommercial.com",
    subjectTemplate: "Algonquian Deal Submission: [Address]",
    bodyTemplate: "Dear Capital Partner, Algonquian Real Estate has officially submitted an underwriting-compliant offer of $[Mao] for [Address], [City], CT. View underwriting models in Buyer Portal.",
    isActive: false
  }
];

export const SEED_TEMPLATES: DocTemplate[] = [
  {
    id: "temp-loi",
    title: "Non-Binding Letter of Intent (LOI)",
    category: FolderCategory.Acquisition,
    description: "Standard primary deal intake LOI submitted direct-to-owner to establish purchase terms and initiate due diligence periods.",
    content: `ALGONQUIAN REAL ESTATE LLC
Waterbury, Connecticut

LETTER OF INTENT TO ACQUIRE REAL PROPERTY

Date: June 16, 2026

To: [OwnerName]
Property Address: [Address], [City], [State] [ZipCode]

Dear Seller,

On behalf of Algonquian Real Estate LLC, we are pleased to submit this non-binding Letter of Intent (LOI) to purchase the real property referenced above according to the following terms and underwriting criteria developed under the leadership of Gregory Jones, Managing Member:

1. PURCHASE PRICE: $[Price]
The proposed purchase price shall be [Price] Dollars, subject to final physical inspection, title validation, and underwriting approvals during the Due Diligence phase.

2. TERMS of PAYMENT:
[PaymentTerms]

3. DUE DILIGENCE:
Purchaser shall have thirty (30) business days from the receipt of an executed Purchase and Sale Agreement to inspect the property, perform structural assessments, and review occupancy, operating books, and local Connecticut zoning compliance.

4. CLOSING:
Closing of title shall occur on or before fifteen (15) days following the expiration of the Due Diligence Period, at a mutually agreeable local Connecticut title firm.

5. NON-BINDING NATURE:
This Letter of Intent represents only our strategic intent and is non-binding upon either party until a definitive Purchase and Sale Agreement is drafted and bi-laterally executed.

Sovereignly Submitted,

ALGONQUIAN REAL ESTATE LLC
By: Gregory Jones, Managing Member

_____________________________________
Purchaser E-Signature: GREGORY JONES

_____________________________________
Accepted by Seller: [OwnerName]`
  },
  {
    id: "temp-financing",
    title: "Seller Financing Addendum",
    category: FolderCategory.Finance,
    description: "Legal addendum laying out down-payment, interest schedules, monthly interest-only payments, and balloon maturity structures for seller-direct deals.",
    content: `ALEXANDER & ALGONQUIAN CONTRACT SUPPLEMENT
SELLER FINANCING RIDER AND ADDENDUM

Pursuant to the Purchase and Sale Agreement entered into by and between Algonquian Real Estate LLC ("Purchaser") and [OwnerName] ("Seller") for the transfer of [Address], [City], CT:

The Seller agrees to extend purchase money credit to the Purchaser on the following specific financing terms:

1. PRINCIPAL LOAN AMOUNT: $[LoanAmount]
(Calculated as Purchase Price minus Down Payment of $[DownPayment])

2. INTEREST SCHEDULE:
Interest shall accrue on the unpaid principal balance at the rate of [InterestRate]% per annum, computed monthly.

3. REPAYMENT STRUCTURE:
Purchaser shall pay Seller monthly installments of $[MonthlyPayment] comprising amortized or interest-only allocations commencing on the date of title transfer and continuing for a term of [TermMonths] months.

4. BALLOON REDEMPTION:
Any remaining principal balance, accrued interest, and related loan allocations shall become fully due and payable in one single balloon payment of $[BalloonPayment] on the [TermMonths]th month following execution.

5. PREPAYMENT PRIVILEGES:
Purchaser maintains the absolute sovereign right to prepay this Note in full or in part at any time without fee or penalty.

Represented and Executed:

PURCHASER:
ALGONQUIAN REAL ESTATE LLC
By: Gregory Jones, Managing Member

_____________________________________
Gregory Jones, Managing Member

SELLER:
_____________________________________
[OwnerName]`
  },
  {
    id: "temp-jv",
    title: "Joint Venture Partner Operating Agreement",
    category: FolderCategory.JointVenture,
    description: "Venture agreement for private lenders and family offices establishing return metrics, sponsor fees, and Gregory Jones' management authorities.",
    content: `ALGONQUIAN VENTURE CAPITAL PARTNERSHIP
JOINT VENTURE DEVELOPMENT AGREEMENT

This Agreement is made on June 16, 2026, by and between Algonquian Real Estate LLC, managing member Gregory Jones ("Sponsor"), and Joint Venture Capital Partner representing [InvestorName] ("JV Partner"):

1. PURPOSE:
The Parties form this strategic Joint Venture to acquire, renovate, operate, and cash-flow the real property asset located at [Address], [City], CT.

2. CAPITAL CONTRIBUTIONS:
- Sponsor (Algonquian Real Estate LLC) shall coordinate 100% of sourcing, underwriting, technology infrastructure via ARE Tech, seller negotiation, and property management. Contribution: Intellectual & Operational Capital.
- JV Partner shall inject capital in the amount of $[CapitalAmount] toward acquisition, reserves, and renovation.

3. CAPITAL DISTRIBUTION (YIELD PREFERENCE):
Cash flow from operations shall be disbursed monthly in the following sequence:
- Class A preferred return: [TargetYield]% annualized to the JV Partner.
- Class B sponsor return: Remaining operational cash flow to Algonquian Real Estate LLC.

4. OPERATIONAL DICTATE & AUTHORITY:
All daily operational, real estate management, technological implementation, and disposal decisions ultimately report through Gregory Jones, Managing Member.

By: Gregory Jones, Managing Member
Algonquian Real Estate LLC

_____________________________________
Sponsor Signature

By: For GP-LP Partners
_____________________________________
JV Partner Representative`
  },
  {
    id: "temp-dd",
    title: "Connecticut Due Diligence & Underwriting Checklist",
    category: FolderCategory.Management,
    description: "Multi-point checklist ensuring local municipal title search, zoning verification, tenant escrow reviews, and structural audits are certified.",
    content: `ALGONQUIAN REAL ESTATE LLC
DUE DILIGENCE PROTOCOL v2.0 - CONNECTICUT UTILITY

This operational form must be certified by Algonquian Real Estate underwriting systems before clearing deal flow to 'Funded & Closed' state.

Project Address: [Address], [City], CT

[ ] MUNICIPAL TITLE SEARCH: Perform thorough title check at the municipal clerk's office (Waterbury, Hartford, or relevant CT town clerk). Confirm absence of mechanic liens, local tax encumbrances, or municipal utility liens.

[ ] ENVIRONMENTAL & STRUCTURAL AUDIT: Verify basement dry-state, roof remaining service life, electrical configuration (minimum 200 amp service for multi-family units), and lead paint disclosures for CT properties built pre-1978.

[ ] TENANT ESTOPPEL & ESCROW: Obtain certified estoppel certificates verifying existing lease agreements, monthly rent, and security deposit escrows currently held in Connecticut banking institutions.

[ ] MAO VERIFICATION: Cross-examine MAO engine values:
    (After Repair Value * 70%) - Repairs - Target Fees. Must match actual seller target price or seller financing interest margins.

[ ] SOVEREIGN COMPLIANCE: Confirm registration and operational alignment with strategic directives.

Audited and Verified:
_____________________________________
Property Coordinator, ARE Tech

Certified:
_____________________________________
Gregory Jones, Managing Member`
  }
];
