// Opportunity Mode — Looking For / I Provide category system

export const LOOKING_FOR_CATEGORIES = [
  {
    id: "business_funding",
    label: "Business Funding",
    icon: "DollarSign",
    subcategories: [
      { id: "construction_funding", label: "Construction Funding" },
      { id: "ground_up_development", label: "Ground-Up Development" },
      { id: "fix_and_flip", label: "Fix-and-Flip Financing" },
      { id: "commercial_bridge_loans", label: "Commercial Bridge Loans" },
      { id: "multifamily_financing", label: "Multifamily Financing" },
      { id: "equipment_financing", label: "Equipment Financing" },
      { id: "working_capital", label: "Working Capital" },
      { id: "business_lines_of_credit", label: "Business Lines of Credit" },
      { id: "acquisition_financing", label: "Acquisition Financing" },
    ],
  },
  {
    id: "capital_partners",
    label: "Capital & Partners",
    icon: "Handshake",
    subcategories: [
      { id: "investors", label: "Investors" },
      { id: "business_partners", label: "Business Partners" },
      { id: "venture_capital", label: "Venture Capital" },
      { id: "angel_investment", label: "Angel Investment" },
      { id: "joint_ventures", label: "Joint Ventures" },
    ],
  },
  {
    id: "talent_services",
    label: "Talent & Services",
    icon: "Users",
    subcategories: [
      { id: "software_developers", label: "Software Developers" },
      { id: "marketing_services", label: "Marketing Services" },
      { id: "contractors", label: "Contractors" },
      { id: "vendors", label: "Vendors" },
      { id: "employees", label: "Employees" },
      { id: "mentors", label: "Mentors" },
      { id: "legal_services", label: "Legal Services" },
      { id: "accounting_services", label: "Accounting Services" },
      { id: "recruiting", label: "Recruiting" },
    ],
  },
  {
    id: "supply_chain",
    label: "Supply Chain & Partners",
    icon: "Truck",
    subcategories: [
      { id: "manufacturing_partners", label: "Manufacturing Partners" },
      { id: "distribution_partners", label: "Distribution Partners" },
      { id: "wholesale_suppliers", label: "Wholesale Suppliers" },
    ],
  },
  {
    id: "real_estate",
    label: "Real Estate & Acquisitions",
    icon: "Building",
    subcategories: [
      { id: "property_opportunities", label: "Property Opportunities" },
      { id: "real_estate_development", label: "Real Estate Development" },
      { id: "business_acquisitions", label: "Business Acquisitions" },
    ],
  },
  {
    id: "growth",
    label: "Growth & Strategy",
    icon: "TrendingUp",
    subcategories: [
      { id: "ai_automation", label: "AI Automation" },
      { id: "lead_generation", label: "Lead Generation" },
      { id: "consulting", label: "Consulting" },
      { id: "mentorship", label: "Mentorship" },
    ],
  },
];

export const PROVIDE_CATEGORIES = [
  {
    id: "lending",
    label: "Lending & Financing",
    icon: "DollarSign",
    subcategories: [
      { id: "construction_lending", label: "Construction Lending" },
      { id: "commercial_lending", label: "Commercial Lending" },
      { id: "private_lending", label: "Private Lending" },
      { id: "bridge_financing", label: "Bridge Financing" },
      { id: "equipment_financing_prov", label: "Equipment Financing" },
      { id: "working_capital_prov", label: "Working Capital Loans" },
      { id: "business_loc", label: "Business Lines of Credit" },
    ],
  },
  {
    id: "investment_capital",
    label: "Investment Capital",
    icon: "TrendingUp",
    subcategories: [
      { id: "venture_capital_prov", label: "Venture Capital" },
      { id: "angel_investment_prov", label: "Angel Investment" },
      { id: "private_equity", label: "Private Equity" },
      { id: "joint_ventures_prov", label: "Joint Ventures" },
    ],
  },
  {
    id: "tech_services",
    label: "Technology & Services",
    icon: "Code",
    subcategories: [
      { id: "software_development", label: "Software Development" },
      { id: "ai_automation_prov", label: "AI Automation" },
      { id: "marketing_prov", label: "Marketing" },
      { id: "lead_generation_prov", label: "Lead Generation" },
    ],
  },
  {
    id: "professional_services",
    label: "Professional Services",
    icon: "Briefcase",
    subcategories: [
      { id: "legal_services_prov", label: "Legal Services" },
      { id: "accounting_prov", label: "Accounting" },
      { id: "consulting_prov", label: "Consulting" },
      { id: "recruiting_prov", label: "Recruiting" },
    ],
  },
  {
    id: "construction_real_estate",
    label: "Construction & Real Estate",
    icon: "Building",
    subcategories: [
      { id: "construction_services", label: "Construction Services" },
      { id: "real_estate_development_prov", label: "Real Estate Development" },
      { id: "property_management", label: "Property Management" },
    ],
  },
  {
    id: "supply_manufacturing",
    label: "Supply & Manufacturing",
    icon: "Factory",
    subcategories: [
      { id: "manufacturing_prov", label: "Manufacturing" },
      { id: "wholesale_distribution", label: "Wholesale Distribution" },
    ],
  },
];

// Flatten helpers
export const ALL_LOOKING_FOR = LOOKING_FOR_CATEGORIES.flatMap((c) =>
  c.subcategories.map((s) => ({ ...s, categoryId: c.id, categoryLabel: c.label }))
);
export const ALL_PROVIDES = PROVIDE_CATEGORIES.flatMap((c) =>
  c.subcategories.map((s) => ({ ...s, categoryId: c.id, categoryLabel: c.label }))
);

export function getLookingForLabel(id) {
  return ALL_LOOKING_FOR.find((s) => s.id === id)?.label || id;
}
export function getProvidesLabel(id) {
  return ALL_PROVIDES.find((s) => s.id === id)?.label || id;
}

// Cross-reference: map a "looking for" need to matching "provides" categories
export const NEED_TO_PROVIDER_MAP = {
  construction_funding: ["construction_lending", "private_lending", "bridge_financing"],
  ground_up_development: ["construction_lending", "private_lending"],
  fix_and_flip: ["private_lending", "bridge_financing"],
  commercial_bridge_loans: ["bridge_financing", "commercial_lending"],
  multifamily_financing: ["commercial_lending", "private_lending"],
  equipment_financing: ["equipment_financing_prov"],
  working_capital: ["working_capital_prov", "business_loc"],
  business_lines_of_credit: ["business_loc"],
  acquisition_financing: ["commercial_lending", "private_lending"],
  investors: ["venture_capital_prov", "angel_investment_prov", "private_equity"],
  business_partners: ["joint_ventures_prov", "private_equity"],
  venture_capital: ["venture_capital_prov"],
  angel_investment: ["angel_investment_prov"],
  joint_ventures: ["joint_ventures_prov"],
  software_developers: ["software_development"],
  marketing_services: ["marketing_prov"],
  contractors: ["construction_services"],
  vendors: ["wholesale_distribution"],
  employees: ["recruiting_prov"],
  mentors: ["consulting_prov"],
  legal_services: ["legal_services_prov"],
  accounting_services: ["accounting_prov"],
  recruiting: ["recruiting_prov"],
  manufacturing_partners: ["manufacturing_prov"],
  distribution_partners: ["wholesale_distribution"],
  wholesale_suppliers: ["wholesale_distribution"],
  property_opportunities: ["real_estate_development_prov"],
  real_estate_development: ["real_estate_development_prov", "construction_services"],
  business_acquisitions: ["private_equity", "consulting_prov"],
  ai_automation: ["ai_automation_prov"],
  lead_generation: ["lead_generation_prov"],
  consulting: ["consulting_prov"],
  mentorship: ["consulting_prov"],
};