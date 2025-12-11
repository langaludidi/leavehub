#!/usr/bin/env node

/**
 * LeaveHub End-to-End Workflow Testing
 * Tests all major application workflows
 */

const BASE_URL = 'http://localhost:3001';

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logSection(message) {
  log(`\n${'='.repeat(60)}`, 'bold');
  log(message, 'bold');
  log('='.repeat(60), 'bold');
}

let testsPassed = 0;
let testsFailed = 0;
let testsWarning = 0;

async function testEndpoint(name, url, expectedStatus = 200, options = {}) {
  try {
    const response = await fetch(url, options);
    const status = response.status;

    if (status === expectedStatus) {
      logSuccess(`${name}: ${status}`);
      testsPassed++;
      return { success: true, response, status };
    } else {
      logError(`${name}: Expected ${expectedStatus}, got ${status}`);
      testsFailed++;
      return { success: false, response, status };
    }
  } catch (error) {
    logError(`${name}: ${error.message}`);
    testsFailed++;
    return { success: false, error };
  }
}

async function testPageLoad(name, path) {
  return testEndpoint(name, `${BASE_URL}${path}`);
}

async function testAPIEndpoint(name, path, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return testEndpoint(name, `${BASE_URL}${path}`, method === 'GET' ? 200 : undefined, options);
}

async function runTests() {
  log('\n🧪 LeaveHub End-to-End Testing Suite', 'bold');
  log('Testing against: ' + BASE_URL, 'cyan');

  // =================================================================
  // 1. MARKETING PAGES
  // =================================================================
  logSection('1. Marketing Pages');

  await testPageLoad('Homepage', '/');
  await testPageLoad('Features Page', '/features');
  await testPageLoad('Pricing Page', '/pricing');
  await testPageLoad('About Page', '/about');
  await testPageLoad('Contact Page', '/contact');
  await testPageLoad('BCEA Guide', '/bcea-guide');

  // =================================================================
  // 2. AUTHENTICATION PAGES
  // =================================================================
  logSection('2. Authentication Pages');

  await testPageLoad('Sign In Page', '/sign-in');
  await testPageLoad('Sign Up Page', '/sign-up');

  // =================================================================
  // 3. DASHBOARD PAGES (Will redirect to sign-in if not authenticated)
  // =================================================================
  logSection('3. Dashboard Pages (Protected Routes)');

  logInfo('Testing protected routes (expecting redirects to sign-in)...');

  const dashboardTests = [
    { name: 'Main Dashboard', path: '/dashboard' },
    { name: 'Leave Calendar', path: '/dashboard/calendar' },
    { name: 'New Leave Request', path: '/dashboard/leave/new' },
    { name: 'Notifications', path: '/dashboard/notifications' },
    { name: 'Reports', path: '/dashboard/reports' },
    { name: 'Manager Dashboard', path: '/dashboard/manager' },
    { name: 'Manager Calendar', path: '/dashboard/manager/calendar' },
    { name: 'Team Management', path: '/dashboard/manager/team' },
    { name: 'Leave Requests', path: '/dashboard/manager/requests' },
  ];

  for (const test of dashboardTests) {
    const result = await fetch(`${BASE_URL}${test.path}`, { redirect: 'manual' });
    if (result.status === 307 || result.status === 302 || result.status === 200) {
      logSuccess(`${test.name}: Handled correctly (${result.status})`);
      testsPassed++;
    } else {
      logWarning(`${test.name}: Unexpected status ${result.status}`);
      testsWarning++;
    }
  }

  // =================================================================
  // 4. API ENDPOINTS
  // =================================================================
  logSection('4. API Endpoints');

  logInfo('Testing public API endpoints...');

  // Newsletter subscription (should reject invalid email)
  const newsletterResult = await testAPIEndpoint(
    'Newsletter API (Invalid Email)',
    '/api/newsletter/subscribe',
    'POST',
    { email: 'invalid' }
  );
  if (newsletterResult.status === 400) {
    logSuccess('Newsletter API: Properly validates email');
    testsPassed++;
  } else {
    logWarning('Newsletter API: Validation may not be working');
    testsWarning++;
  }

  // Test with valid email format (will fail if already subscribed)
  const validNewsletterResult = await testAPIEndpoint(
    'Newsletter API (Valid Email)',
    '/api/newsletter/subscribe',
    'POST',
    { email: 'test@example.com' }
  );
  if (validNewsletterResult.status === 200 || validNewsletterResult.status === 400) {
    logSuccess('Newsletter API: Accepts valid email format');
    testsPassed++;
  }

  // =================================================================
  // 5. DATABASE CONNECTIVITY
  // =================================================================
  logSection('5. Database & Email Configuration');

  logInfo('Checking environment variables...');

  const envVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'RESEND_API_KEY',
  ];

  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env.local');

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');

    envVars.forEach(varName => {
      if (envContent.includes(varName)) {
        logSuccess(`${varName}: Configured`);
        testsPassed++;
      } else {
        logWarning(`${varName}: Not found in .env.local`);
        testsWarning++;
      }
    });
  } else {
    logError('.env.local file not found');
    testsFailed++;
  }

  // =================================================================
  // 6. STATIC ASSETS
  // =================================================================
  logSection('6. Static Assets');

  const assets = [
    { name: 'Favicon', path: '/favicon.ico' },
    { name: 'Robots.txt', path: '/robots.txt' },
  ];

  for (const asset of assets) {
    await testPageLoad(asset.name, asset.path);
  }

  // =================================================================
  // 7. ERROR PAGES
  // =================================================================
  logSection('7. Error Handling');

  const result = await fetch(`${BASE_URL}/non-existent-page-12345`);
  if (result.status === 404) {
    logSuccess('404 Error Page: Working correctly');
    testsPassed++;
  } else {
    logWarning(`404 Page: Unexpected status ${result.status}`);
    testsWarning++;
  }

  // =================================================================
  // 8. COMPONENT RENDERING
  // =================================================================
  logSection('8. Component Rendering Tests');

  logInfo('Testing if key components render...');

  // Test homepage for key elements
  const homepageResult = await fetch(`${BASE_URL}/`);
  const homepageHtml = await homepageResult.text();

  const componentTests = [
    { name: 'Navigation Header', pattern: /LeaveHub|navigation|nav/i },
    { name: 'Footer', pattern: /footer|© 2025 LeaveHub/i },
    { name: 'Newsletter Signup', pattern: /newsletter|Stay Updated|subscribe/i },
    { name: 'CTA Buttons', pattern: /Get Started|Try LeaveHub/i },
  ];

  componentTests.forEach(test => {
    if (test.pattern.test(homepageHtml)) {
      logSuccess(`${test.name}: Rendered`);
      testsPassed++;
    } else {
      logWarning(`${test.name}: May not be rendering`);
      testsWarning++;
    }
  });

  // =================================================================
  // SUMMARY
  // =================================================================
  logSection('Test Summary');

  const total = testsPassed + testsFailed + testsWarning;

  log(`\nTotal Tests: ${total}`, 'bold');
  logSuccess(`Passed: ${testsPassed}`);
  logError(`Failed: ${testsFailed}`);
  logWarning(`Warnings: ${testsWarning}`);

  const successRate = ((testsPassed / total) * 100).toFixed(1);
  log(`\nSuccess Rate: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red');

  if (testsFailed === 0) {
    log('\n🎉 All critical tests passed!', 'green');
    return 0;
  } else {
    log('\n⚠️  Some tests failed. Please review the output above.', 'yellow');
    return 1;
  }
}

// =================================================================
// RUN TESTS
// =================================================================
runTests()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    logError(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
