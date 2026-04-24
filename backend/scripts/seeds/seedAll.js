// backend/scripts/seeds/seedAll.js
// Script to run all seed scripts in order

const { execSync } = require('child_process');
const path = require('path');

const seedScripts = [
  'seedRoles.js',
  'seedPermissions.js',
  'seedRolePermissions.js',
  'seedUsers.js',
  'seedCategories.js',
  'seedSchoolTypes.js',
  'seedRegions.js',
  'seedSchools.js',
  'seedNews.js',
  'seedNewsViewStats.js',
  'seedContacts.js',
  'seedContactNotes.js',
  'seedFaqs.js',
  'seedSchoolReviews.js',
  'seedStaticPages.js',
  'seedSettings.js',
  'seedNotificationSettings.js',
  // Add more seed scripts here if needed
];

async function runAllSeeds() {
  for (const script of seedScripts) {
    const scriptPath = path.join(__dirname, script);
    try {
      console.log(`\n--- Running ${script} ---`);
      execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
    } catch (err) {
      console.error(`Error running ${script}:`, err.message);
      // Continue to next script
    }
  }
  console.log('\nAll seed scripts executed!');
}

runAllSeeds();
