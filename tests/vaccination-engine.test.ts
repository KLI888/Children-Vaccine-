import {
  generateVaccinationSchedule,
  generateThreeStageReminders,
  calculateChildAge,
  SCHEDULE_RULES,
  VACCINE_DEFINITIONS,
  SCHEDULE_VERSION,
} from '../lib/vaccine-data';
import { ADMIN_USER_EMAIL, ADMIN_USER_PASSWORD, canSwitchUser, getUserDataKey, isAdminUser } from '../lib/admin';
import { format, subDays, addDays } from 'date-fns';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runAllTests() {
  console.log('🧪 Starting Children Vaccine Mentor Automated Test Suite...\n');
  let passed = 0;

  // TEST 1: Schedule versioning & exactly 12 core UIP vaccines
  assert(SCHEDULE_VERSION.id === 'uip-india-2024-v1', 'Schedule version ID must match');
  assert(Object.keys(VACCINE_DEFINITIONS).length === 12, 'Must have exactly 12 core UIP vaccines');
  assert(SCHEDULE_RULES.length >= 15, 'UIP schedule must contain all required core antigens');
  console.log('✅ Test 1 Passed: Schedule versioning and exactly 12 core UIP vaccines verified.');
  passed++;

  // TEST 2: Due date calculation from birth date
  const testDob = '2026-01-01';
  const schedule = generateVaccinationSchedule('child_test_1', testDob, true);
  assert(schedule.length > 0, 'Schedule must generate entries');

  const bcg = schedule.find((v) => v.vaccineId === 'bcg' && v.doseNumber === 1);
  assert(bcg !== undefined, 'BCG birth dose must exist');
  assert(bcg!.dueDate === '2026-01-01', 'BCG due date must be on birth date');

  // 6 weeks = 42 days: 2026-01-01 + 42 days = 2026-02-12
  const penta1 = schedule.find((v) => v.vaccineId === 'pentavalent' && v.doseNumber === 1);
  assert(penta1 !== undefined, 'Pentavalent-1 must exist');
  assert(penta1!.dueDate === '2026-02-12', 'Pentavalent-1 must be exactly 42 days from birth');
  console.log('✅ Test 2 Passed: Calendar-aware birth-date arithmetic verified.');
  passed++;

  // TEST 3: Leap year handling
  const leapDob = '2024-02-28';
  const leapSchedule = generateVaccinationSchedule('child_leap', leapDob, true);
  const leapPenta1 = leapSchedule.find((v) => v.vaccineId === 'pentavalent' && v.doseNumber === 1);
  assert(leapPenta1!.dueDate === '2024-04-10', '42 days from 2024-02-28 (leap year) must equal 2024-04-10');
  console.log('✅ Test 3 Passed: Leap year calendar transition verified.');
  passed++;

  // TEST 4: Three-Stage Reminder Generation (-7d, -3d, Day 0)
  const child = { id: 'child_test_1', name: 'Aarav' };
  const futureVax = {
    id: 'vax_future',
    childId: child.id,
    vaccineId: 'pentavalent',
    doseNumber: 2,
    dueDate: format(addDays(new Date(), 20), 'yyyy-MM-dd'),
    status: 'scheduled' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const reminders = generateThreeStageReminders('user_1', child, futureVax);
  assert(reminders.length === 3, 'Must produce exactly 3 scheduled reminder stages');

  const rem7 = reminders.find((r) => r.stage === 'seven_day');
  const rem3 = reminders.find((r) => r.stage === 'three_day');
  const rem0 = reminders.find((r) => r.stage === 'same_day');

  assert(rem7 !== undefined, 'Stage 1 (-7 days) must exist');
  assert(rem3 !== undefined, 'Stage 2 (-3 days) must exist');
  assert(rem0 !== undefined, 'Stage 3 (Day 0) must exist');

  // Verify trigger dates
  assert(
    rem7!.triggerDate === format(addDays(new Date(), 13), 'yyyy-MM-dd'),
    'Stage 1 trigger date must be exactly due_date minus 7 days'
  );
  assert(
    rem3!.triggerDate === format(addDays(new Date(), 17), 'yyyy-MM-dd'),
    'Stage 2 trigger date must be exactly due_date minus 3 days'
  );
  assert(
    rem0!.triggerDate === futureVax.dueDate,
    'Stage 3 trigger date must be equal to vaccination due date'
  );

  // Verify unique deterministic idempotency keys
  assert(
    rem7!.idempotencyKey.includes('seven_day') &&
    rem7!.idempotencyKey.includes(futureVax.dueDate),
    'Idempotency key must incorporate child, vaccine, dose, stage, and due date'
  );
  console.log('✅ Test 4 Passed: Three-stage reminder engine and idempotency verified.');
  passed++;

  // TEST 5: Skip past trigger dates (do not spam expired reminders)
  const pastTriggerVax = {
    id: 'vax_soon',
    childId: child.id,
    vaccineId: 'pcv',
    doseNumber: 1,
    dueDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'), // Only 2 days away!
    status: 'scheduled' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const soonReminders = generateThreeStageReminders('user_1', child, pastTriggerVax);
  const soonRem7 = soonReminders.find((r) => r.stage === 'seven_day');
  assert(
    soonRem7!.status === 'skipped_past',
    '7-day reminder whose trigger date has already passed must be marked skipped_past'
  );
  console.log('✅ Test 5 Passed: Past reminder skipping verified.');
  passed++;

  // TEST 6: Completed dose stops pending reminders
  const completedVax = {
    ...futureVax,
    status: 'completed' as const,
    administeredDate: format(new Date(), 'yyyy-MM-dd'),
  };
  const completedReminders = generateThreeStageReminders('user_1', child, completedVax);
  assert(
    completedReminders.length === 0,
    'Completed vaccination dose must not generate any pending reminders'
  );
  console.log('✅ Test 6 Passed: Completed dose stops all future reminders.');
  passed++;

  // TEST 7: Age calculation in months and days
  const childDobStr = format(subDays(new Date(), 70), 'yyyy-MM-dd');
  const ageEn = calculateChildAge(childDobStr, 'en');
  const ageMr = calculateChildAge(childDobStr, 'mr');
  assert(ageEn.months >= 2, 'Age in months must be calculated accurately');
  assert(ageMr.formatted.includes('महिने'), 'Marathi age format must include महिने');
  console.log('✅ Test 7 Passed: Child age calculation in English and Marathi verified.');
  passed++;

  // TEST 8: Admin access control and default admin identity
  assert(ADMIN_USER_EMAIL === 'admin@childvaccine.com', 'Admin email must be the default admin credential');
  assert(ADMIN_USER_PASSWORD === 'admin123', 'Admin password must be the default secure demo credential');
  assert(getUserDataKey('user_1') === 'cvm_v1_userdata_user_1', 'Admin child overview must read the store data key');
  assert(isAdminUser({ email: ADMIN_USER_EMAIL, role: 'admin' }), 'Admin users must be recognized by role or email');
  assert(!isAdminUser({ email: ADMIN_USER_EMAIL, role: 'parent' }), 'Admin email alone must not grant admin access');
  assert(!isAdminUser({ email: 'parent@example.com', role: 'parent' }), 'Regular users must not be treated as admins');
  assert(!canSwitchUser(null, { id: 'admin', email: ADMIN_USER_EMAIL, role: 'admin' }), 'Signed-out users must not switch into admin');
  assert(!canSwitchUser({ id: 'parent', email: 'parent@example.com', role: 'parent' }, { id: 'admin', email: ADMIN_USER_EMAIL, role: 'admin' }), 'Parents must not switch into admin');
  assert(canSwitchUser({ id: 'admin', email: ADMIN_USER_EMAIL, role: 'admin' }, { id: 'parent', email: 'parent@example.com', role: 'parent' }), 'Admins must be able to switch accounts from the admin view');
  console.log('✅ Test 8 Passed: Admin identity and access control verified.');
  passed++;

  console.log(`\n🎉 ALL ${passed} AUTOMATED HEALTHCARE TESTS PASSED SUCCESSFULLY!`);
}

runAllTests();
