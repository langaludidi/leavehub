/**
 * Leave Types Logic and Document Requirements
 * Based on BCEA (Basic Conditions of Employment Act) and South African labor laws
 */

import { differenceInDays, differenceInWeeks, subWeeks } from 'date-fns';

export type LeaveCode = 'ANN' | 'SICK' | 'FAM' | 'MAT' | 'PAT' | 'ADOP' | 'SURR' | 'COMP' | 'STUDY' | 'UNPAID' | 'OTHER';

export interface DocumentRequirement {
  required: boolean;
  type: 'medical_certificate' | 'proof_document' | 'court_order' | 'adoption_papers' | 'death_certificate' | 'surrogacy_agreement' | 'birth_certificate' | 'other';
  description: string;
  deadline?: string; // When the document must be submitted
  bceasection?: string; // Relevant BCEA section
}

export interface LeaveTypeValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  documentRequirements: DocumentRequirement[];
  bceaviolations: string[];
}

export interface LeaveRequestData {
  leaveTypeCode: LeaveCode;
  startDate: Date;
  endDate: Date;
  workingDays: number;
  reason: string;
  userId: string;
  // Additional context for validation
  recentSickLeaveRequests?: Array<{ startDate: Date; endDate: Date; workingDays: number }>;
  employeeHireDate?: Date;
  isPregnant?: boolean;
  gender?: 'male' | 'female' | 'other';
}

/**
 * Determine if a leave type requires supporting documentation
 */
export function requiresDocumentation(leaveTypeCode: LeaveCode): boolean {
  const typesRequiringDocs: LeaveCode[] = ['SICK', 'MAT', 'PAT', 'ADOP', 'SURR', 'FAM', 'STUDY', 'UNPAID'];
  return typesRequiringDocs.includes(leaveTypeCode);
}

/**
 * Get document requirements for a specific leave request
 */
export function getDocumentRequirements(request: LeaveRequestData): DocumentRequirement[] {
  const requirements: DocumentRequirement[] = [];

  switch (request.leaveTypeCode) {
    case 'SICK':
      requirements.push(...getSickLeaveDocumentRequirements(request));
      break;

    case 'MAT':
      requirements.push({
        required: true,
        type: 'medical_certificate',
        description: 'Medical confirmation of pregnancy & expected due date',
        deadline: 'Before maternity leave starts',
        bceasection: 'BCEA Section 25',
      });
      requirements.push({
        required: false,
        type: 'birth_certificate',
        description: 'Post-birth birth certificate or hospital discharge summary (for payroll/records)',
        deadline: 'After birth, within 2 weeks of return',
        bceasection: 'BCEA Section 25',
      });
      break;

    case 'PAT':
      requirements.push({
        required: true,
        type: 'birth_certificate',
        description: 'Birth certificate or confirmation of expected or actual birth from the hospital',
        deadline: 'Within 2 weeks of return',
        bceasection: 'BCEA Section 25A',
      });
      requirements.push({
        required: false,
        type: 'court_order',
        description: 'For adoption: court/adoption placement order',
        deadline: 'Before leave starts',
        bceasection: 'BCEA Section 25A',
      });
      break;

    case 'ADOP':
      requirements.push({
        required: true,
        type: 'adoption_papers',
        description: "Legal adoption placement order issued by the Children's Court",
        deadline: 'Before adoption leave starts',
        bceasection: 'BCEA Section 25C',
      });
      break;

    case 'SURR':
      requirements.push({
        required: true,
        type: 'surrogacy_agreement',
        description: 'Surrogacy agreement signed and registered by the High Court',
        deadline: 'Before commissioning parental leave starts',
        bceasection: 'Employment Equity Amendment Act 2021',
      });
      break;

    case 'FAM':
      requirements.push({
        required: true,
        type: 'proof_document',
        description: 'Death certificate/funeral pamphlet/affidavit (for death); doctor/hospital note (for illness); birth confirmation (for birth of child)',
        deadline: 'Within 2 days of return',
        bceasection: 'BCEA Section 27',
      });
      break;

    case 'STUDY':
      requirements.push({
        required: true,
        type: 'proof_document',
        description: 'Proof of exam registration or proof of scheduled examination',
        deadline: 'Before study leave starts',
      });
      break;

    case 'UNPAID':
      requirements.push({
        required: true,
        type: 'other',
        description: 'Written motivation and proof of necessity (especially for immigration, court appearance, travel, etc.)',
        deadline: 'Before unpaid leave starts',
      });
      break;

    case 'ANN':
    case 'COMP':
    case 'OTHER':
    default:
      // No documentation required
      break;
  }

  return requirements;
}

/**
 * Get sick leave specific document requirements based on BCEA rules
 */
function getSickLeaveDocumentRequirements(request: LeaveRequestData): DocumentRequirement[] {
  const requirements: DocumentRequirement[] = [];

  // Rule 1: More than 2 consecutive days requires medical certificate
  if (request.workingDays > 2) {
    requirements.push({
      required: true,
      type: 'medical_certificate',
      description: "Doctor's medical certificate required for sick leave exceeding 2 consecutive days. Certificate must be from a registered medical practitioner (HPCSA number visible).",
      deadline: 'Upon return to work or within 2 days',
      bceasection: 'BCEA Section 23(1)',
    });
  }

  // Rule 2: More than 2 occasions in 8 weeks requires medical certificate
  if (request.recentSickLeaveRequests && request.recentSickLeaveRequests.length >= 2) {
    const eightWeeksAgo = subWeeks(request.startDate, 8);
    const recentAbsences = request.recentSickLeaveRequests.filter(
      req => req.startDate >= eightWeeksAgo
    );

    if (recentAbsences.length >= 2) {
      requirements.push({
        required: true,
        type: 'medical_certificate',
        description: "Doctor's medical certificate required: This is your 3rd sick leave absence in an 8-week period. Certificate must be from a registered medical practitioner (HPCSA number visible).",
        deadline: 'Upon return to work or within 2 days',
        bceasection: 'BCEA Section 23(2)',
      });
    }
  }

  // If no certificate required, note that
  if (requirements.length === 0) {
    requirements.push({
      required: false,
      type: 'medical_certificate',
      description: 'No medical certificate required for 1-2 consecutive days (unless you have had 2+ other sick leave occasions in the past 8 weeks)',
      bceasection: 'BCEA Section 23',
    });
  }

  return requirements;
}

/**
 * Validate a leave request against BCEA rules
 */
export function validateLeaveRequest(request: LeaveRequestData): LeaveTypeValidation {
  const validation: LeaveTypeValidation = {
    isValid: true,
    errors: [],
    warnings: [],
    documentRequirements: getDocumentRequirements(request),
    bceaviolations: [],
  };

  // Validate based on leave type
  switch (request.leaveTypeCode) {
    case 'SICK':
      validateSickLeave(request, validation);
      break;

    case 'ANN':
      validateAnnualLeave(request, validation);
      break;

    case 'MAT':
      validateMaternityLeave(request, validation);
      break;

    case 'PAT':
      validatePaternityLeave(request, validation);
      break;

    case 'FAM':
      validateFamilyResponsibilityLeave(request, validation);
      break;

    case 'ADOP':
      validateAdoptionLeave(request, validation);
      break;

    case 'SURR':
      validateSurrogacyLeave(request, validation);
      break;

    default:
      // No specific validation for other types
      break;
  }

  // Set isValid based on errors
  validation.isValid = validation.errors.length === 0;

  return validation;
}

/**
 * Validate sick leave request
 */
function validateSickLeave(request: LeaveRequestData, validation: LeaveTypeValidation): void {
  // BCEA allows 30 days sick leave per 3-year cycle (6 weeks)
  // For first 6 months: 1 day per month worked
  if (request.employeeHireDate) {
    const monthsEmployed = differenceInWeeks(request.startDate, request.employeeHireDate) / 4.33;

    if (monthsEmployed < 6) {
      const entitledDays = Math.floor(monthsEmployed);
      if (request.workingDays > entitledDays) {
        validation.warnings.push(
          `You have been employed for ${monthsEmployed.toFixed(1)} months. You are entitled to ${entitledDays} sick days. This request may exceed your entitlement.`
        );
        validation.bceaviolations.push('BCEA Section 22(3): Sick leave during first 6 months');
      }
    }
  }

  // Warn about excessive sick leave
  if (request.workingDays > 30) {
    validation.warnings.push(
      'This request exceeds the typical 30-day sick leave cycle. Extended sick leave may require additional HR review.'
    );
  }

  // Check for medical certificate requirement
  const medicalCertRequired = validation.documentRequirements.some(
    req => req.type === 'medical_certificate' && req.required
  );

  if (medicalCertRequired && !request.reason.toLowerCase().includes('certificate')) {
    validation.warnings.push(
      'Medical certificate is required for this sick leave request. Please attach it to your application.'
    );
  }
}

/**
 * Validate annual leave request
 */
function validateAnnualLeave(request: LeaveRequestData, validation: LeaveTypeValidation): void {
  // BCEA Section 20: 21 consecutive days per year OR 1 day per 17 days worked

  // Warn about long leave periods
  if (request.workingDays > 21) {
    validation.warnings.push(
      'This request exceeds the standard 21-day annual leave entitlement. Please ensure you have sufficient leave balance.'
    );
  }

  // Encourage minimum leave taking
  if (request.workingDays < 2) {
    validation.warnings.push(
      'Consider taking a longer break. BCEA encourages employees to take adequate rest periods.'
    );
  }
}

/**
 * Validate maternity leave request
 */
function validateMaternityLeave(request: LeaveRequestData, validation: LeaveTypeValidation): void {
  // BCEA Section 25: 4 consecutive months (120 days)
  const totalDays = differenceInDays(request.endDate, request.startDate) + 1;

  if (totalDays > 120) {
    validation.errors.push(
      'Maternity leave cannot exceed 4 consecutive months (120 days) as per BCEA Section 25.'
    );
    validation.bceaviolations.push('BCEA Section 25(1): Maternity leave duration');
  }

  // Check gender
  if (request.gender && request.gender !== 'female') {
    validation.errors.push(
      'Maternity leave is only available to female employees. Male employees should apply for Paternity Leave.'
    );
  }

  // Minimum 4 weeks notice
  validation.warnings.push(
    'Please ensure you provide at least 4 weeks notice before your maternity leave starts, as recommended by BCEA.'
  );
}

/**
 * Validate paternity leave request
 */
function validatePaternityLeave(request: LeaveRequestData, validation: LeaveTypeValidation): void {
  // BCEA Section 25A: 10 consecutive days
  const totalDays = differenceInDays(request.endDate, request.startDate) + 1;

  if (totalDays > 10) {
    validation.errors.push(
      'Paternity leave cannot exceed 10 consecutive days as per BCEA Section 25A.'
    );
    validation.bceaviolations.push('BCEA Section 25A: Paternity leave duration');
  }

  // Must be taken within 6 weeks of birth
  validation.warnings.push(
    'Paternity leave must be taken during the first 6 weeks after the birth of your child.'
  );
}

/**
 * Validate family responsibility leave request
 */
function validateFamilyResponsibilityLeave(request: LeaveRequestData, validation: LeaveTypeValidation): void {
  // BCEA Section 27: 3 days per year
  if (request.workingDays > 3) {
    validation.errors.push(
      'Family Responsibility Leave is limited to 3 days per year as per BCEA Section 27.'
    );
    validation.bceaviolations.push('BCEA Section 27(2): Family responsibility leave entitlement');
  }

  // Check if reason is valid
  const validReasons = [
    'child is born',
    'child is sick',
    'death of spouse',
    'death of parent',
    'death of child',
    'death of grandparent',
    'death of grandchild',
  ];

  const reasonLower = request.reason.toLowerCase();
  const hasValidReason = validReasons.some(reason => reasonLower.includes(reason));

  if (!hasValidReason) {
    validation.warnings.push(
      'Family Responsibility Leave applies to specific situations: birth/sickness of child, or death of immediate family member. Please ensure your reason qualifies.'
    );
  }
}

/**
 * Validate adoption leave request
 */
function validateAdoptionLeave(request: LeaveRequestData, validation: LeaveTypeValidation): void {
  // BCEA Section 25C: 10 consecutive weeks for child under 2 years
  const totalDays = differenceInDays(request.endDate, request.startDate) + 1;
  const maxDays = 10 * 5; // 10 weeks * 5 working days

  if (request.workingDays > maxDays) {
    validation.errors.push(
      'Adoption leave cannot exceed 10 consecutive weeks as per BCEA Section 25C.'
    );
    validation.bceaviolations.push('BCEA Section 25C: Adoption leave duration');
  }

  validation.warnings.push(
    'Adoption leave is available for children under 2 years of age at the time of adoption.'
  );
}

/**
 * Validate surrogacy/commissioning parental leave request
 */
function validateSurrogacyLeave(request: LeaveRequestData, validation: LeaveTypeValidation): void {
  // Commissioning parental leave: 10 consecutive weeks
  const totalDays = differenceInDays(request.endDate, request.startDate) + 1;
  const maxDays = 10 * 5; // 10 weeks * 5 working days

  if (request.workingDays > maxDays) {
    validation.errors.push(
      'Commissioning parental leave cannot exceed 10 consecutive weeks as per Employment Equity Amendment Act 2021.'
    );
    validation.bceaviolations.push('Employment Equity Amendment Act 2021: Commissioning parental leave duration');
  }

  validation.warnings.push(
    'Commissioning parental leave requires a valid surrogacy agreement registered with the High Court.'
  );
}

/**
 * Check if medical certificate is required for this leave request
 */
export function isMedicalCertificateRequired(request: LeaveRequestData): boolean {
  const requirements = getDocumentRequirements(request);
  return requirements.some(req => req.type === 'medical_certificate' && req.required);
}

/**
 * Get a summary of document requirements for display
 */
export function getDocumentRequirementSummary(request: LeaveRequestData): string {
  const requirements = getDocumentRequirements(request);

  if (requirements.length === 0) {
    return 'No supporting documents required for this leave type.';
  }

  const requiredDocs = requirements.filter(req => req.required);

  if (requiredDocs.length === 0) {
    return 'No supporting documents required for this request.';
  }

  const docList = requiredDocs.map(req => `• ${req.description}`).join('\n');

  return `Supporting documents required:\n${docList}`;
}

/**
 * Get BCEA compliance information for a leave type
 */
export function getBCEAInfo(leaveTypeCode: LeaveCode): string {
  const bceasnfo: Record<LeaveCode, string> = {
    ANN: 'BCEA Section 20: Employees are entitled to 21 consecutive days annual leave per year, or 1 day for every 17 days worked.',
    SICK: 'BCEA Section 22: Employees are entitled to paid sick leave of 30 days per 3-year cycle. Medical certificate required after 2 consecutive days or on 3rd occasion in 8 weeks.',
    FAM: 'BCEA Section 27: 3 days family responsibility leave per year when immediate family member is born, sick, or dies.',
    MAT: 'BCEA Section 25: 4 consecutive months (120 days) maternity leave. At least 4 weeks must be taken after birth.',
    PAT: 'BCEA Section 25A: 10 consecutive days paternity leave to be taken during first 6 weeks after birth.',
    ADOP: 'BCEA Section 25C: 10 consecutive weeks adoption leave for children under 2 years of age.',
    SURR: 'Employment Equity Amendment Act 2021: 10 consecutive weeks commissioning parental leave for surrogacy arrangements registered with the High Court.',
    COMP: 'Compensatory time off for overtime worked, as per company policy and BCEA regulations.',
    STUDY: 'Study leave as per company policy. Not mandated by BCEA but commonly provided.',
    UNPAID: 'Unpaid leave as agreed between employer and employee. Subject to company policy.',
    OTHER: 'Other leave types as per company policy and employment contract.',
  };

  return bceasnfo[leaveTypeCode] || 'No specific BCEA information available.';
}

/**
 * Check if employee is eligible for a specific leave type
 */
export function checkLeaveEligibility(
  leaveTypeCode: LeaveCode,
  employeeHireDate: Date,
  requestDate: Date = new Date()
): { eligible: boolean; reason: string } {
  const monthsEmployed = differenceInWeeks(requestDate, employeeHireDate) / 4.33;

  switch (leaveTypeCode) {
    case 'SICK':
      if (monthsEmployed < 1) {
        return {
          eligible: false,
          reason: 'You must be employed for at least 1 month before taking sick leave (BCEA Section 22).',
        };
      }
      return { eligible: true, reason: '' };

    case 'ANN':
      if (monthsEmployed < 12) {
        return {
          eligible: true,
          reason: `You have been employed for ${monthsEmployed.toFixed(1)} months. Annual leave accrues at 1 day per 17 days worked.`,
        };
      }
      return { eligible: true, reason: '' };

    case 'FAM':
      if (monthsEmployed < 4) {
        return {
          eligible: false,
          reason: 'You must be employed for at least 4 months before taking family responsibility leave (BCEA Section 27).',
        };
      }
      return { eligible: true, reason: '' };

    case 'MAT':
    case 'PAT':
    case 'ADOP':
      if (monthsEmployed < 1) {
        return {
          eligible: false,
          reason: 'You must be employed for at least 1 month before taking this leave.',
        };
      }
      return { eligible: true, reason: '' };

    default:
      return { eligible: true, reason: '' };
  }
}
