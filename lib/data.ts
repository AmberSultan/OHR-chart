// ── Inner ring domains — clockwise order from top (per Sunburst Table + Data Mapping col C) ──
export const cultureDomains = [
  { domain: "Opportunity",      description: "The degree to which individuals have fair and accessible pathways to development, advancement, mobility, and career progression.", score: 65, weight: 0.01 },  // 1.1
  { domain: "Contribution",     description: "The extent to which individuals can effectively apply their skills and capability in ways that are recognised and contribute to the organisation's goals and performance.", score: 72, weight: 0.02 },  // 1.2
  { domain: "Safety",           description: "The degree to which people feel physically and psychologically safe at work, including freedom from harm, intimidation, and psychosocial risk.", score: 85, weight: 0.10 },  // 1.3
  { domain: "Job Clarity",      description: "The degree to which roles, responsibilities, expectations, and success criteria are clearly defined and understood.", score: 74, weight: 0.05 },  // 1.4
  { domain: "Job Control",      description: "The level of autonomy and influence individuals have over how, when, and in what order their work is performed.", score: 62, weight: 0.12 },  // 1.5
  { domain: "Job Demand",       description: "The intensity, volume, emotional load, and complexity of work relative to available time, capability, and resources.", score: 55, weight: 0.16 },  // 1.6
  { domain: "Justice",          description: "The perceived fairness, consistency, transparency, and equity of organisational decisions, processes, and treatment.", score: 66, weight: 0.12 },  // 1.7
  { domain: "Relationships",    description: "The quality of interpersonal working relationships, including trust, cooperation, and mutual respect among colleagues.", score: 75, weight: 0.06 },  // 1.8
  { domain: "Reward",           description: "The perceived fairness and adequacy of recognition, remuneration, and acknowledgement for work performed.", score: 60, weight: 0.01 },  // 1.9
  { domain: "Support",          description: "The availability and accessibility of practical, emotional, and organisational resources necessary to perform work effectively.", score: 80, weight: 0.08 },  // 1.10
  { domain: "Leadership",       description: "The capability and behaviour of leaders in setting direction, modelling standards, making sound decisions, and supporting performance and wellbeing.", score: 72, weight: 0.18 },  // 1.11
  { domain: "Inclusion",        description: "The degree to which individuals feel accepted, valued, respected, and able to participate fully without exclusion or marginalisation.", score: 78, weight: 0.10 },  // 1.12
  { domain: "Respectful Norms", description: "The extent to which everyday conduct reflects dignity, civility, and appropriate behavioural boundaries aligned to the intent of the Respect@Work amendment.", score: 70, weight: 0.04 },  // 1.13
  { domain: "Trust",            description: "Confidence in the organisation's integrity, reliability, and follow-through on commitments, decisions, and stated values.", score: 68, weight: 0.05 },  // 1.14
];

// ── Outer ring behaviours — clockwise order from top ──
export const behaviouralIncidents = [
  { behaviour: "Promotions + Succession", description: "This indicates the structural activation of advancement and mobility pathways within the organisation.", ratePerHundred: 0.0, heightBand: 0 },  // 2.1
  { behaviour: "Performance Management",  description: "This indicates the level of structured performance oversight, capability management, and accountability processes occurring within the organisation.", ratePerHundred: 0.0, heightBand: 0 },  // 2.2
  { behaviour: "Bullying",                description: "This indicates the level of reported behavioural concern activity relating to inappropriate or harmful interpersonal conduct.", ratePerHundred: 0.8, heightBand: 3 },  // 2.3
  { behaviour: "Enterprise Management",   description: "This indicates the level of structural role design and organisational architecture activity affecting clarity of accountability and business alignment.", ratePerHundred: 0.0, heightBand: 0 },  // 2.4
  { behaviour: "Discrimination",          description: "This indicates the level of reported behavioural concern activity relating to inappropriate or harmful interpersonal conduct.", ratePerHundred: 0.1, heightBand: 1 },  // 2.7
  { behaviour: "Harassment",              description: "This indicates the level of reported behavioural activity relating to inappropriate or unwelcome conduct.", ratePerHundred: 0.4, heightBand: 2 },  // 2.12
  { behaviour: "Sexual Harassment",       description: "This indicates the level of reported behavioural activity relating to conduct of a sexual nature that is unwelcome or inappropriate.", ratePerHundred: 0.2, heightBand: 1 },  // 2.13
];

// ── Indicator source mapping — from Sunburst Table + Data Mapping (columns N–AA) ──
// Each entry maps an indicator to the workflows/forms/questions that feed its score.
export interface IndicatorSource {
  workflow: string;
  form: string;
  questions: string;  // comma-separated question IDs, or field description
}

export const indicatorSources: Record<string, IndicatorSource[]> = {
  // ── Inner ring ──
  "Opportunity": [
    { workflow: "Offboarding",        form: "Exit_Interview",           questions: "Q9" },
    { workflow: "Culture_Management", form: "Positive_Duty_Assessment", questions: "Q6" },
    { workflow: "Culture_Management", form: "Cultural_Signal_Record",   questions: "Selectable dimension" },
    { workflow: "Onboarding",         form: "New_Starter_Checkin",      questions: "New_Q" },
  ],
  "Contribution": [
    { workflow: "Offboarding",        form: "Exit_Interview",           questions: "Q3" },
    { workflow: "Culture_Management", form: "Psychosocial_Assessment",  questions: "Q8" },
    { workflow: "Culture_Management", form: "Cultural_Signal_Record",   questions: "Selectable dimension" },
    { workflow: "Onboarding",         form: "New_Starter_Checkin",      questions: "Q3" },
  ],
  "Safety": [
    { workflow: "Offboarding",        form: "Exit_Interview",           questions: "Q13" },
    { workflow: "Culture_Management", form: "Positive_Duty_Assessment", questions: "Q4" },
    { workflow: "Culture_Management", form: "Cultural_Signal_Record",   questions: "Selectable dimension" },
    { workflow: "Onboarding",         form: "New_Starter_Checkin",      questions: "Q8, Q13" },
  ],
  "Job Clarity": [
    { workflow: "Offboarding",        form: "Exit_Interview",           questions: "Q2" },
    { workflow: "Culture_Management", form: "Psychosocial_Assessment",  questions: "Q1" },
    { workflow: "Culture_Management", form: "Cultural_Signal_Record",   questions: "Selectable dimension" },
    { workflow: "Onboarding",         form: "New_Starter_Checkin",      questions: "Q2" },
  ],
  "Job Control": [
    { workflow: "Offboarding",        form: "Exit_Interview",           questions: "Q14" },
    { workflow: "Culture_Management", form: "Psychosocial_Assessment",  questions: "Q2" },
    { workflow: "Culture_Management", form: "Cultural_Signal_Record",   questions: "Selectable dimension" },
  ],
  "Job Demand": [
    { workflow: "Offboarding",        form: "Exit_Interview",           questions: "Q7" },
    { workflow: "Culture_Management", form: "Psychosocial_Assessment",  questions: "Q3" },
    { workflow: "Culture_Management", form: "Cultural_Signal_Record",   questions: "Selectable dimension" },
    { workflow: "Onboarding",         form: "New_Starter_Checkin",      questions: "Q4" },
  ],
  "Justice": [
    { workflow: "Offboarding",        form: "Exit_Interview",           questions: "Q6, Q11" },
    { workflow: "Culture_Management", form: "Positive_Duty_Assessment", questions: "Q1" },
    { workflow: "Culture_Management", form: "Cultural_Signal_Record",   questions: "Selectable dimension" },
    { workflow: "Onboarding",         form: "New_Starter_Checkin",      questions: "Q7" },
  ],
  "Relationships": [
    { workflow: "Offboarding",        form: "Exit_Interview",           questions: "Reason for leaving (drop down)" },
    { workflow: "Culture_Management", form: "Psychosocial_Assessment",  questions: "Q5" },
    { workflow: "Culture_Management", form: "Positive_Duty_Assessment", questions: "Q7" },
    { workflow: "Culture_Management", form: "Cultural_Signal_Record",   questions: "Selectable dimension" },
    { workflow: "Onboarding",         form: "New_Starter_Checkin",      questions: "Q16" },
  ],
  "Reward": [
    { workflow: "Offboarding",        form: "Exit_Interview",           questions: "Reason for leaving (drop down)" },
    { workflow: "Culture_Management", form: "Psychosocial_Assessment",  questions: "Q7" },
    { workflow: "Culture_Management", form: "Positive_Duty_Assessment", questions: "Q6" },
    { workflow: "Culture_Management", form: "Cultural_Signal_Record",   questions: "Selectable dimension" },
    { workflow: "Onboarding",         form: "New_Starter_Checkin",      questions: "Q15" },
  ],
  "Support": [
    { workflow: "Offboarding",        form: "Exit_Interview",           questions: "Q4, Q8, Q10" },
    { workflow: "Culture_Management", form: "Psychosocial_Assessment",  questions: "Q4" },
    { workflow: "Culture_Management", form: "Cultural_Signal_Record",   questions: "Selectable dimension" },
    { workflow: "Onboarding",         form: "New_Starter_Checkin",      questions: "Q5, Q11, Q12" },
  ],
  "Leadership": [
    { workflow: "Offboarding",        form: "Exit_Interview",           questions: "Reason for leaving (drop down)" },
    { workflow: "Culture_Management", form: "Cultural_Signal_Record",   questions: "Selectable dimension" },
  ],
  "Inclusion": [
    { workflow: "Offboarding",        form: "Exit_Interview",           questions: "Q5" },
    { workflow: "Culture_Management", form: "Positive_Duty_Assessment", questions: "Q3" },
    { workflow: "Culture_Management", form: "Cultural_Signal_Record",   questions: "Selectable dimension" },
    { workflow: "Onboarding",         form: "New_Starter_Checkin",      questions: "Q10" },
  ],
  "Respectful Norms": [
    { workflow: "Culture_Management", form: "Positive_Duty_Assessment", questions: "Q4, Q5" },
    { workflow: "Culture_Management", form: "Cultural_Signal_Record",   questions: "Selectable dimension" },
    { workflow: "Onboarding",         form: "New_Starter_Checkin",      questions: "Q9, Q14" },
  ],
  "Trust": [
    { workflow: "Offboarding",        form: "Exit_Interview",           questions: "Q" },
    { workflow: "Culture_Management", form: "Positive_Duty_Assessment", questions: "Q2" },
    { workflow: "Culture_Management", form: "Cultural_Signal_Record",   questions: "Selectable dimension" },
    { workflow: "Onboarding",         form: "New_Starter_Checkin",      questions: "Q17" },
  ],
  // ── Outer ring ──
  "Promotions + Succession": [
    { workflow: "Culture_Management",            form: "Cultural_Signal_Record",              questions: "Selectable dimension" },
    { workflow: "Employment_Agreements",         form: "TBC form name",                       questions: "Count of yes to reason 'promotion'" },
    { workflow: "Succession_Planning",           form: "Positions in succession planning",    questions: "Succession_rate" },
  ],
  "Performance Management": [
    { workflow: "Culture_Management",            form: "Cultural_Signal_Record",              questions: "Selectable dimension" },
    { workflow: "Performance_Management",        form: "TBC form name",                       questions: "Count of performance management workflows opened" },
  ],
  "Bullying": [
    { workflow: "Culture_Management",            form: "Cultural_Signal_Record",              questions: "Selectable dimension" },
    { workflow: "Workplace_Investigator",        form: "Preliminary_Assessment",              questions: "Count of 'yes' to bullying" },
  ],
  "Enterprise Management": [
    { workflow: "Position_Management",           form: "Count of workflows",                  questions: "position management_rate" },
    { workflow: "Transformation",                form: "Count of workflows",                  questions: "transformation_rate" },
  ],
  "Discrimination": [
    { workflow: "Culture_Management",            form: "Cultural_Signal_Record",              questions: "Selectable dimension" },
    { workflow: "Workplace_Investigator",        form: "Preliminary_Assessment",              questions: "Count of 'yes' to discrimination" },
  ],
  "Harassment": [
    { workflow: "Culture_Management",            form: "Cultural_Signal_Record",              questions: "Selectable dimension" },
    { workflow: "Workplace_Investigator",        form: "Preliminary_Assessment",              questions: "Count of 'yes' to harassment" },
  ],
  "Sexual Harassment": [
    { workflow: "Culture_Management",            form: "Cultural_Signal_Record",              questions: "Selectable dimension" },
    { workflow: "Workplace_Investigator",        form: "Preliminary_Assessment",              questions: "Count of 'yes' to sexual harassment" },
  ],
};

// ── Source response records — format per brief col E ──
// Only one real example record exists from the spreadsheet.
// Replace with live exported data when available.
export interface SourceRecord {
  id: string;
  timestamp: string;
  workflowId: string;
  questionId: string;
  indicatorId: string;
  responseValue: 1 | -1;
  respondentId: string;
}

export const sourceRecords: SourceRecord[] = [
  // Real example record from spreadsheet
  { id: "2026021101", timestamp: "11/02/2026", workflowId: "Offboarding",         questionId: "Exit_Q8",                 indicatorId: "Opportunity",      responseValue:  1, respondentId: "IVANCIC, Jessie"    },
  // Sample records — replace with live exported data when available
  { id: "2026021102", timestamp: "11/02/2026", workflowId: "Offboarding",         questionId: "Exit_Q3",                 indicatorId: "Contribution",     responseValue:  1, respondentId: "MORRISON, Dale"     },
  { id: "2026021103", timestamp: "11/02/2026", workflowId: "Culture_Management",  questionId: "Q8",                      indicatorId: "Contribution",     responseValue: -1, respondentId: "CHEN, Lin"          },
  { id: "2026021104", timestamp: "12/02/2026", workflowId: "Offboarding",         questionId: "Exit_Q13",                indicatorId: "Safety",           responseValue:  1, respondentId: "PATEL, Raj"         },
  { id: "2026021105", timestamp: "12/02/2026", workflowId: "Culture_Management",  questionId: "Q4",                      indicatorId: "Safety",           responseValue:  1, respondentId: "NGUYEN, Linh"       },
  { id: "2026021106", timestamp: "12/02/2026", workflowId: "Offboarding",         questionId: "Exit_Q2",                 indicatorId: "Job Clarity",      responseValue: -1, respondentId: "SMITH, Aaron"       },
  { id: "2026021107", timestamp: "13/02/2026", workflowId: "Culture_Management",  questionId: "Q1",                      indicatorId: "Job Clarity",      responseValue:  1, respondentId: "JOHNSON, Marie"     },
  { id: "2026021108", timestamp: "13/02/2026", workflowId: "Offboarding",         questionId: "Exit_Q14",                indicatorId: "Job Control",      responseValue: -1, respondentId: "WALKER, Ben"        },
  { id: "2026021109", timestamp: "13/02/2026", workflowId: "Culture_Management",  questionId: "Q2",                      indicatorId: "Job Control",      responseValue: -1, respondentId: "LEE, Sandra"        },
  { id: "2026021110", timestamp: "14/02/2026", workflowId: "Offboarding",         questionId: "Exit_Q7",                 indicatorId: "Job Demand",       responseValue: -1, respondentId: "TAYLOR, Chris"      },
  { id: "2026021111", timestamp: "14/02/2026", workflowId: "Culture_Management",  questionId: "Q3",                      indicatorId: "Job Demand",       responseValue: -1, respondentId: "ANDERSON, Kim"      },
  { id: "2026021112", timestamp: "14/02/2026", workflowId: "Offboarding",         questionId: "Exit_Q6",                 indicatorId: "Justice",          responseValue: -1, respondentId: "BROWN, Marcus"      },
  { id: "2026021113", timestamp: "15/02/2026", workflowId: "Culture_Management",  questionId: "Q1",                      indicatorId: "Justice",          responseValue:  1, respondentId: "DAVIS, Priya"       },
  { id: "2026021114", timestamp: "15/02/2026", workflowId: "Offboarding",         questionId: "Exit_Q5",                 indicatorId: "Relationships",    responseValue:  1, respondentId: "WILSON, Tara"       },
  { id: "2026021115", timestamp: "15/02/2026", workflowId: "Culture_Management",  questionId: "Q5",                      indicatorId: "Relationships",    responseValue:  1, respondentId: "HARRIS, Joel"       },
  { id: "2026021116", timestamp: "16/02/2026", workflowId: "Offboarding",         questionId: "Reason for leaving",      indicatorId: "Reward",           responseValue: -1, respondentId: "MARTIN, Fiona"      },
  { id: "2026021117", timestamp: "16/02/2026", workflowId: "Culture_Management",  questionId: "Q7",                      indicatorId: "Reward",           responseValue: -1, respondentId: "THOMPSON, Sam"      },
  { id: "2026021118", timestamp: "16/02/2026", workflowId: "Offboarding",         questionId: "Exit_Q4",                 indicatorId: "Support",          responseValue:  1, respondentId: "GARCIA, Rosa"       },
  { id: "2026021119", timestamp: "17/02/2026", workflowId: "Culture_Management",  questionId: "Q4",                      indicatorId: "Support",          responseValue:  1, respondentId: "CLARK, Owen"        },
  { id: "2026021120", timestamp: "17/02/2026", workflowId: "Offboarding",         questionId: "Reason for leaving",      indicatorId: "Leadership",       responseValue: -1, respondentId: "ROBINSON, Sue"      },
  { id: "2026021121", timestamp: "17/02/2026", workflowId: "Culture_Management",  questionId: "Selectable dimension",    indicatorId: "Leadership",       responseValue:  1, respondentId: "LEWIS, Paul"        },
  { id: "2026021122", timestamp: "18/02/2026", workflowId: "Offboarding",         questionId: "Exit_Q5",                 indicatorId: "Inclusion",        responseValue:  1, respondentId: "LEE, Michael"       },
  { id: "2026021123", timestamp: "18/02/2026", workflowId: "Culture_Management",  questionId: "Q3",                      indicatorId: "Inclusion",        responseValue:  1, respondentId: "HALL, Dana"         },
  { id: "2026021124", timestamp: "18/02/2026", workflowId: "Culture_Management",  questionId: "Q4",                      indicatorId: "Respectful Norms", responseValue: -1, respondentId: "ALLEN, James"       },
  { id: "2026021125", timestamp: "19/02/2026", workflowId: "Culture_Management",  questionId: "Q5",                      indicatorId: "Respectful Norms", responseValue:  1, respondentId: "YOUNG, Claire"      },
  { id: "2026021126", timestamp: "19/02/2026", workflowId: "Offboarding",         questionId: "Exit_Q",                  indicatorId: "Trust",            responseValue: -1, respondentId: "HERNANDEZ, Carlos"  },
  { id: "2026021127", timestamp: "19/02/2026", workflowId: "Culture_Management",  questionId: "Q2",                      indicatorId: "Trust",            responseValue:  1, respondentId: "KING, Natasha"      },
  { id: "2026021128", timestamp: "20/02/2026", workflowId: "Offboarding",         questionId: "Exit_Q9",                 indicatorId: "Opportunity",      responseValue: -1, respondentId: "SCOTT, Andrew"      },
  // Outer ring — behaviour response records
  { id: "2026021201", timestamp: "11/02/2026", workflowId: "Workplace_Investigator", questionId: "Preliminary_Assessment", indicatorId: "Bullying",         responseValue: -1, respondentId: "CONFIDENTIAL"       },
  { id: "2026021202", timestamp: "13/02/2026", workflowId: "Workplace_Investigator", questionId: "Preliminary_Assessment", indicatorId: "Bullying",         responseValue: -1, respondentId: "CONFIDENTIAL"       },
  { id: "2026021203", timestamp: "15/02/2026", workflowId: "Workplace_Investigator", questionId: "Preliminary_Assessment", indicatorId: "Harassment",       responseValue: -1, respondentId: "CONFIDENTIAL"       },
  { id: "2026021204", timestamp: "17/02/2026", workflowId: "Workplace_Investigator", questionId: "Preliminary_Assessment", indicatorId: "Discrimination",   responseValue: -1, respondentId: "CONFIDENTIAL"       },
  { id: "2026021205", timestamp: "19/02/2026", workflowId: "Workplace_Investigator", questionId: "Preliminary_Assessment", indicatorId: "Sexual Harassment", responseValue: -1, respondentId: "CONFIDENTIAL"      },
];

export const behaviourStatusMix = [
  { behaviour: "Bullying",   status: "Reported",        proportion: 0.20 },
  { behaviour: "Bullying",   status: "Investigating",   proportion: 0.30 },
  { behaviour: "Bullying",   status: "Substantiated",   proportion: 0.40 },
  { behaviour: "Bullying",   status: "Unsubstantiated", proportion: 0.10 },
  { behaviour: "Harassment", status: "Reported",        proportion: 0.25 },
  { behaviour: "Harassment", status: "Investigating",   proportion: 0.25 },
  { behaviour: "Harassment", status: "Substantiated",   proportion: 0.20 },
  { behaviour: "Harassment", status: "Unsubstantiated", proportion: 0.30 },
];

export const statusColors: Record<string, string> = {
  Reported:                  "#FDDFD5",
  Investigating:             "#F89E80",
  Substantiated:             "#D44A27",
  "Partially Substantiated": "#F2603C",
  Unsubstantiated:           "#FBCAB8",
};

export function getScoreColor(score: number): string {
  if (score >= 80) return "#81C784";
  if (score >= 65) return "#FFB74D";
  return "#E57373";
}

export function calculateCultureIndex(): number {
  const weightedSum = cultureDomains.reduce(
    (sum, d) => sum + d.score * d.weight,
    0
  );
  return Math.round(weightedSum * 10) / 10;
}
