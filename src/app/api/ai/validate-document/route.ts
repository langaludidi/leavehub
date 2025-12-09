import { NextRequest, NextResponse } from 'next/server';
import { anthropic, AI_MODEL, isAIEnabled } from '@/lib/ai/client';

export async function POST(request: NextRequest) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json(
        {
          isValid: true,
          message: 'AI document validation is not enabled. Document accepted by default.',
          warnings: [],
        },
        { status: 200 }
      );
    }

    const body = await request.json();
    const { documentBase64, documentType, leaveType, mimeType } = body;

    if (!documentBase64) {
      return NextResponse.json(
        { error: 'No document provided' },
        { status: 400 }
      );
    }

    // Determine what to look for based on document type
    const validationCriteria = getValidationCriteria(documentType, leaveType);

    // Call Claude with vision to analyze the document
    const message = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType || 'image/jpeg',
                data: documentBase64,
              },
            },
            {
              type: 'text',
              text: `You are an AI assistant validating leave documents for a South African company following BCEA regulations.

**Document Type:** ${documentType}
**Leave Type:** ${leaveType}

**Required Elements to Check:**
${JSON.stringify(validationCriteria, null, 2)}

**Task:**
Analyze this document image and verify it meets the requirements. Check for:
1. Document authenticity indicators (letterheads, logos, official formatting)
2. Required information fields
3. Dates and validity
4. Signatures or official stamps
5. Professional appearance
6. Completeness

**Response Format (JSON):**
{
  "isValid": boolean,
  "confidence": "low|medium|high",
  "summary": "Brief assessment of the document",
  "foundElements": [
    {
      "element": "What was found",
      "status": "present|missing|unclear"
    }
  ],
  "warnings": [
    "Any concerns or missing elements"
  ],
  "recommendation": "Should this be accepted, rejected, or flagged for manual review?"
}

**Important:**
- Be helpful but thorough
- Flag suspicious documents but don't be overly strict
- If unsure, recommend manual review
- Consider cultural context (South African medical certificates, etc.)

Respond with ONLY valid JSON, no additional text.`,
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse AI response
    let validation;
    try {
      validation = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        { error: 'AI returned invalid response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      validation,
      documentType,
      leaveType,
    });

  } catch (error) {
    console.error('Error in AI document validation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

interface ValidationCriteria {
  required: string[];
  optional: string[];
  redFlags: string[];
}

/**
 * Get validation criteria based on document type
 */
function getValidationCriteria(documentType: string, leaveType: string) {
  const criteria: Record<string, ValidationCriteria> = {
    medical_certificate: {
      required: [
        'Doctor/practitioner name and HPCSA number (Health Professions Council of South Africa)',
        'Patient name',
        'Date of consultation',
        'Medical condition or reason for sick leave (can be general)',
        'Recommended leave period',
        'Practice stamp or letterhead',
        'Doctor signature',
        'Contact details of practice',
      ],
      optional: [
        'HPCSA registration number visible',
        'Practice address',
        'Date issued',
      ],
      redFlags: [
        'Handwritten notes without letterhead',
        'Missing HPCSA number',
        'Photocopied signature',
        'Inconsistent dates',
      ],
    },
    birth_certificate: {
      required: [
        'Child full name',
        'Date of birth',
        'Parent names',
        'Department of Home Affairs logo/branding',
        'Registration number',
        'Official stamp or seal',
        'Date of issue',
      ],
      optional: [
        'Place of birth',
        'ID numbers of parents',
      ],
      redFlags: [
        'Poor quality photocopy',
        'Missing official stamps',
        'Altered dates',
      ],
    },
    court_order: {
      required: [
        'Court name and location',
        'Case/matter number',
        'Judge or magistrate name',
        'Date of order',
        'Parties involved',
        'Court seal/stamp',
        'Order details',
      ],
      optional: [
        'Lawyer details',
        'Court registrar signature',
      ],
      redFlags: [
        'Missing court seal',
        'Unsigned document',
        'Inconsistent formatting',
      ],
    },
    surrogacy_agreement: {
      required: [
        'High Court registration confirmation',
        'Court seal',
        'Parties to agreement (commissioning parents, surrogate)',
        'Date of agreement',
        'Registration number',
        'Judge approval',
      ],
      optional: [
        'Legal representative details',
        'Notary stamp',
      ],
      redFlags: [
        'Not registered with High Court',
        'Missing judicial approval',
        'Incomplete parties information',
      ],
    },
    death_certificate: {
      required: [
        'Deceased name',
        'Date of death',
        'Department of Home Affairs branding',
        'Registration number',
        'Official stamp',
        'Date of issue',
      ],
      optional: [
        'Place of death',
        'Cause of death',
        'ID number',
      ],
      redFlags: [
        'Missing DHA logo',
        'Altered information',
        'Poor quality scan',
      ],
    },
    proof_of_study: {
      required: [
        'Educational institution name and logo',
        'Student name',
        'Course/program name',
        'Exam date(s) or study period',
        'Institution contact details',
        'Official signature or stamp',
      ],
      optional: [
        'Student number',
        'Exam timetable',
        'Registration confirmation',
      ],
      redFlags: [
        'Missing institution branding',
        'Handwritten without official stamp',
        'Unclear dates',
      ],
    },
  };

  return criteria[documentType] || {
    required: ['Document appears legitimate and relevant to leave request'],
    optional: ['Official stamps', 'Signatures', 'Dates'],
    redFlags: ['Poor quality', 'Missing key information', 'Suspicious formatting'],
  };
}
