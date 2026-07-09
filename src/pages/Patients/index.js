// Keeps backward compatibility: any existing `import Patients from '../pages/Patients'`
// (or wherever this folder lives) will keep resolving exactly as before,
// now pointing at the split-up implementation.
export { default } from './PatientsPage'
