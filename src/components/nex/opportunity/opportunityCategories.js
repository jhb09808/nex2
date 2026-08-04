// Opportunity Engine — Four intelligent profile sections
// I AM (role/title) · I PROVIDE (services) · I'M LOOKING FOR (needs) · AVAILABLE FOR (engagement type)

export const I_AM_OPTIONS = [
  { id: "software_engineer", label: "Software Engineer" },
  { id: "sales_representative", label: "Sales Representative" },
  { id: "construction_company", label: "Construction Company" },
  { id: "commercial_lender", label: "Commercial Lender" },
  { id: "startup_founder", label: "Startup Founder" },
  { id: "videographer", label: "Videographer" },
  { id: "restaurant_owner", label: "Restaurant Owner" },
  { id: "recruiter", label: "Recruiter" },
  { id: "marketing_agency", label: "Marketing Agency" },
  { id: "investor", label: "Investor" },
  { id: "attorney", label: "Attorney" },
  { id: "accountant", label: "Accountant" },
  { id: "real_estate_developer", label: "Real Estate Developer" },
  { id: "ai_developer", label: "AI Developer" },
  { id: "graphic_designer", label: "Graphic Designer" },
  { id: "photographer", label: "Photographer" },
  { id: "business_consultant", label: "Business Consultant" },
  { id: "property_manager", label: "Property Manager" },
  { id: "manufacturer", label: "Manufacturer" },
  { id: "wholesaler", label: "Wholesaler" },
  { id: "freelancer", label: "Freelancer" },
  { id: "content_creator", label: "Content Creator" },
  { id: "product_manager", label: "Product Manager" },
  { id: "data_scientist", label: "Data Scientist" },
];

export const AVAILABLE_FOR_OPTIONS = [
  { id: "full_time_hiring", label: "Full-Time Hiring" },
  { id: "contract_work", label: "Contract Work" },
  { id: "freelance", label: "Freelance" },
  { id: "networking", label: "Networking" },
  { id: "partnership", label: "Partnership" },
  { id: "investment", label: "Investment" },
  { id: "mentorship", label: "Mentorship" },
  { id: "vendor_relationships", label: "Vendor Relationships" },
  { id: "business_development", label: "Business Development" },
];

export const HIRING_EMPLOYMENT_TYPES = [
  { id: "full_time", label: "Full-Time" },
  { id: "part_time", label: "Part-Time" },
  { id: "internship", label: "Internship" },
  { id: "commission", label: "Commission" },
  { id: "contract", label: "Contract" },
];

export const HIRING_WORK_MODES = [
  { id: "remote", label: "Remote" },
  { id: "hybrid", label: "Hybrid" },
  { id: "on_site", label: "On-Site" },
];

export const FUNDING_PURPOSES = [
  { id: "construction_loan", label: "Construction Loan" },
  { id: "commercial_real_estate", label: "Commercial Real Estate" },
  { id: "bridge_loan", label: "Bridge Loan" },
  { id: "equipment_financing", label: "Equipment Financing" },
  { id: "working_capital", label: "Working Capital" },
  { id: "acquisition", label: "Acquisition" },
];

// Opportunity category sections for Discovery feed
export const OPPORTUNITY_SECTIONS = [
  { id: "hiring_now", label: "Hiring Now", icon: "Briefcase" },
  { id: "seeking_investors", label: "Seeking Investors", icon: "TrendingUp" },
  { id: "looking_for_funding", label: "Looking For Funding", icon: "DollarSign" },
  { id: "businesses_looking_for_clients", label: "Businesses Looking For Clients", icon: "Handshake" },
  { id: "freelancers_available", label: "Freelancers Available", icon: "Users" },
  { id: "service_marketplace", label: "Service Marketplace", icon: "Wrench" },
  { id: "local_opportunities", label: "Local Opportunities", icon: "MapPin" },
  { id: "global_opportunities", label: "Global Opportunities", icon: "Globe" },
];

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
      { id: "co_founders", label: "Co-Founders" },
    ],
  },
  {
    id: "talent_services",
    label: "Talent & Services",
    icon: "Users",
    subcategories: [
      { id: "software_developers", label: "Software Developers" },
      { id: "ai_developers", label: "AI Developers" },
      { id: "sales_representatives", label: "Sales Representatives" },
      { id: "marketing_services", label: "Marketing Services" },
      { id: "contractors", label: "Contractors" },
      { id: "vendors", label: "Vendors" },
      { id: "employees", label: "Employees" },
      { id: "interns", label: "Interns" },
      { id: "mentors", label: "Mentors" },
      { id: "freelancers", label: "Freelancers" },
      { id: "legal_services", label: "Legal Services" },
      { id: "accounting_services", label: "Accounting Services" },
      { id: "recruiting", label: "Recruiting" },
      { id: "manufacturers", label: "Manufacturers" },
      { id: "suppliers", label: "Suppliers" },
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
      { id: "networking", label: "Networking" },
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
      { id: "marketing_prov", label: "Marketing Services" },
      { id: "lead_generation_prov", label: "Lead Generation" },
      { id: "video_production", label: "Video Production" },
      { id: "web_development", label: "Web Development" },
      { id: "graphic_design", label: "Graphic Design" },
      { id: "seo_services", label: "SEO" },
      { id: "paid_ads", label: "Paid Ads" },
      { id: "crm_setup", label: "CRM Setup" },
    ],
  },
  {
    id: "professional_services",
    label: "Professional Services",
    icon: "Briefcase",
    subcategories: [
      { id: "legal_services_prov", label: "Legal Services" },
      { id: "accounting_prov", label: "Accounting" },
      { id: "consulting_prov", label: "Business Consulting" },
      { id: "recruiting_prov", label: "Recruiting" },
      { id: "sales_training", label: "Sales Training" },
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
  {
    id: "employment",
    label: "Employment Opportunities",
    icon: "Users",
    subcategories: [
      { id: "hiring_full_time", label: "Full-Time Positions" },
      { id: "hiring_part_time", label: "Part-Time Positions" },
      { id: "hiring_internship", label: "Internships" },
      { id: "hiring_contract", label: "Contract Roles" },
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
export function getIAmLabel(id) {
  return I_AM_OPTIONS.find((s) => s.id === id)?.label || id;
}
export function getAvailableForLabel(id) {
  return AVAILABLE_FOR_OPTIONS.find((s) => s.id === id)?.label || id;
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
  co_founders: ["joint_ventures_prov"],
  software_developers: ["software_development"],
  ai_developers: ["ai_automation_prov"],
  sales_representatives: ["hiring_full_time", "recruiting_prov"],
  marketing_services: ["marketing_prov"],
  contractors: ["construction_services"],
  vendors: ["wholesale_distribution"],
  employees: ["hiring_full_time", "recruiting_prov"],
  interns: ["hiring_internship"],
  mentors: ["consulting_prov"],
  freelancers: ["hiring_contract"],
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
  networking: ["consulting_prov"],
  manufacturers: ["manufacturing_prov"],
  suppliers: ["wholesale_distribution"],
};

// Reverse map: provider → matching needs
export const PROVIDER_TO_NEED_MAP = Object.entries(NEED_TO_PROVIDER_MAP).reduce((acc, [needId, provIds]) => {
  provIds.forEach((pid) => {
    if (!acc[pid]) acc[pid] = [];
    acc[pid].push(needId);
  });
  return acc;
}, {});