// npm run content:validate
// Fails (exit 1) when any place has an unsupported claim, a missing source or bad coordinates.
import { SEED_PLACES } from '../../src/data/seed/places';
import { validateAll } from '../../src/lib/validatePlace';

const issues = validateAll(SEED_PLACES);
for (const issue of issues) {
  console.log(`${issue.severity === 'error' ? 'ERROR  ' : 'warning'}  ${issue.placeId}: ${issue.message}`);
}
const errors = issues.filter((i) => i.severity === 'error').length;
console.log(`\n${SEED_PLACES.length} places, ${errors} errors, ${issues.length - errors} warnings`);
process.exit(errors > 0 ? 1 : 0);
