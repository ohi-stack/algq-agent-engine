/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum FolderCategory {
  Acquisition = "Acquisition Templates",
  Finance = "Finance & Seller-Direct",
  JointVenture = "JV & Capital Raising",
  Management = "Management & Due Diligence"
}

export enum DealStatus {
  Intake = "New Intake",
  DueDiligence = "Due Diligence",
  Underwriting = "Underwriting",
  OfferSubmitted = "Offer Submitted",
  SellerNegotiation = "Seller Negotiation",
  UnderContract = "Under Contract",
  Funded = "Funded & Closed",
  Archived = "Archived"
}

export interface RealEstateDeal {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: "Single Family" | "Multi-Family" | "Commercial" | "Land" | "Mixed-Use";
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  askingPrice: number;
  arv: number; // After Repair Value
  estimatedRepairs: number;
  wholesaleFee: number;
  mao: number; // Maximum Allowable Offer
  status: DealStatus;
  occupancy: "Owner Occupied" | "Tenant Occupied" | "Vacant" | "Abandoned";
  hasSellerFinancing: boolean;
  sellerFinancingDetails?: {
    downPayment: number;
    interestRate: number;
    termMonths: number;
    monthlyPayment: number;
    balloonPayment: number;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FundingSource {
  id: string;
  name: string;
  type: "Private Lender" | "Joint Venture Partner" | "Sponsor Equity" | "Institutional Debt";
  contactPerson: string;
  maxAmount: number;
  targetYield: number;
  status: "Active" | "Inactive" | "Under Discussion";
  activeAllocated: number;
  notes: string;
}

export interface AutomationTrigger {
  id: string;
  title: string;
  event: string; // e.g., "ON_DEAL_INTAKE" or "ON_STATUS_CHANGE_UNDERWRITING"
  actionType: "Email Alert" | "SMS Alert" | "Document Draft" | "CRM Log" | "Webhook";
  recipient: string;
  subjectTemplate: string;
  bodyTemplate: string;
  isActive: boolean;
}

export interface DocTemplate {
  id: string;
  title: string;
  category: FolderCategory;
  description: string;
  content: string;
}
