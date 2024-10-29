# Control

## How I Checked & Controlled This Project
1. Tested all website features
2. Verified documentation completeness
3. Created test protocol
4. Identified issues and created GitHub issues
5. Documented remaining limitations
6. Performed security access testing

## Website Testing Results
| Test | Status | Description |
|------|---------|------------|
| QR Code Generation | ✅ Passed | QR codes generate correctly |
| Ticket Creation | ✅ Passed | Creates tickets with valid data |
| Registration | ✅ Passed | Users can register successfully |
| Login | ✅ Passed | Authentication works properly |
| Low Cost Tickets (<0.5 CHF) | ❌ Failed | Should prevent creation due to Stripe minimum |
| Past Event Creation | ❌ Failed | Should prevent creation of past events |
| Stripe Redirect | ✅ Passed | Payment flow works correctly |
| QR Scanner | ✅ Passed | Works on Android, MacOS, Windows, Linux |
| iOS Scanning | ❌ Failed | Security limitations on iOS |
| IBAN Payout | ❌ Failed | Manual process required, automation pending |
| User Data Isolation | ❌ Failed | Users can potentially access other users' data |
| Security Rules | ❌ Failed | Firebase rules not strict enough |

Firebase success log:
![image](https://github.com/user-attachments/assets/fc8e12cb-0361-4ffa-842d-49113faa474f)

[Stripe](https://dashboard.stripe.com/workbench/logs#wb-N4Igdghgbglg5hALjA9mEAuUBjArgJ3wFMxEAlFXRIzUSAWxoxAHUB5MgaQCEBRAOQDCACQD6AGTYBxAMogANCAAOEfBHoBnWgF9FGoquwALHXoP5jMiADMmwXSCMQNJ5iAcAbJEQ3lK1LSwQFCgifFgiAHdacHUmVg4eARFRNgA1XjI0gEleFndFABMfZEhkNEC6OMwErj4hMRZebmE2Nk45ByJQ0krYxhr2OuSxXgz+ABVOxQ8UOD6GeKGkholpOUUVNU1TEH1DV3szA6tbXacXGoLHAw9EQ-6lxPqU4V4AQXEJ4Wuw-BR8Atqsxli9RmQyBxpiBiqFZkowtkwBp4EZEECBiDniNRNl+DJslJhFNrjBkQjsIgATFFoNsas8TIAAq8QQTDjXDTqJQeHw04G1FYpGTvACyTPEvGhLiIHg8-MxgrBohkb3E4mu2GI3gAIiUyUhUGAWDAAF6qQoKp7DVZNFptDqiQRkD4TXjXSKy7AoTFVRWgnFNcSCNii90OfSIUrzK10m3C3gTCZ42TXALRmTYEiqVAY61CsRumTJ-hSFWCATvMjZNidBwQSkwUITCAAIxqsxjikQbeEMF8AIAnpgANrBULhGBREAAXUU-yoRD7A-ww4wI798R171V3DYVZ1CmUqnUlQj5mMu32FiMpzsDgurhABU3cYLa1TmxPOyw54OV4vW8bHvRRHyubQZwjM0yTgGp6AgAAPGB6DNIhLVAohUUQTAACYAFYAAZFFgFFWxgDwYEQQdRRQYoahImBW15I9Oz6axyOoQEYkYe5aNHZQUF8I9il5ahZyKGBiEbNAYm9MAwCISlRDJTBEHwXAiEUOSFKU-xMGsCAPH0MwPGsVT1KICNKAsOwQAgJQYHMjSimcIxWxQC0nMsrTtWoS0gjuJgAEYAHYAGYCJwoKABYcIADmigiku0c9eUpNDxDmGpiAAR1EKQACslE4egADY4AAKQAVTIGBRQAMQQljkMo3CCJSoA) success log:
![image](https://github.com/user-attachments/assets/3b87ee0c-5ccc-445a-8d9b-5509ca0938df)


## Documentation Verification
All documentation sections completed and verified:
| Document | Status |
|----------|---------|
| Inform | ✅ Passed |
| Plan | ✅ Passed |
| Decide | ✅ Passed |
| Frontend Realization | ✅ Passed |
| Backend Realization | ✅ Passed |
| Control | ✅ Passed |
| Evaluation | ✅ Passed |
| Security Documentation | ❌ Failed |

## Created Issues for Failed Tests
Due to time constraints, these issues remain open for future development:

### [Issue #36](https://github.com/Nepomuk5665/ShitTicket/issues/36): Minimum Price Check
**Title:** "Add minimum price validation for ticket creation"

**Description:** "Currently, the system allows creation of tickets less than 0.5 CHF, which Stripe cannot process. Need to add frontend and backend validation to prevent tickets under 0.5 CHF from being created."
- Priority: High
- Status: Open
- Time estimate: 2-3 hours

### [Issue #37](https://github.com/Nepomuk5665/ShitTicket/issues/37): Past Date Validation
**Title:** "Prevent creation of events in the past"

**Description:** "System currently allows events to be created with past dates. Need to add date validation on both frontend and backend to ensure only future dates can be selected."
- Priority: Medium
- Status: Open
- Time estimate: 1-2 hours

### [Issue #38](https://github.com/Nepomuk5665/ShitTicket/issues/38): iOS Scanner Compatibility
**Title:** "Fix QR scanner compatibility on iOS devices"

**Description:** "Scanner doesn't work properly on iOS due to security restrictions. Need to implement alternative camera handling for iOS devices and test on multiple iOS versions."
- Priority: High
- Status: Open
- Time estimate: 4-5 hours

### [Issue #39](https://github.com/Nepomuk5665/ShitTicket/issues/39): Automate IBAN Payouts
**Title:** "Implement automatic IBAN payouts"

**Description:** "Currently payouts to event creators are handled manually. Need to implement automatic payout system using Stripe Connect or similar service to handle automated IBAN transfers."
- Priority: Medium
- Status: Open
- Time estimate: 8-10 hours

### [Issue #40](https://github.com/Nepomuk5665/ShitTicket/issues/40): Enhance Security Rules
**Title:** "Implement stricter Firebase security rules"

**Description:** "Current security rules allow potential access to other users' data. Need to implement better security rules to ensure proper data isolation."
- Priority: Critical
- Status: Open
- Time estimate: 3-4 hours

## Test Protocol
* Complete test protocol: [Google Sheet](https://docs.google.com/spreadsheets/d/1Z1QQc2RJvuFWbhcTCpFHncJb-vXWN5Jc-3CDtvcGwo0/edit?usp=sharing)
* All failed tests have corresponding GitHub issues
* Testing performed across multiple platforms
* Security testing protocol needs to be developed

## Time Constraints
Due to project deadlines, we were unable to implement fixes for the identified issues. These remain documented in GitHub for future development phases. Total estimated time needed for all fixes: 18-24 hours, including security improvements.
