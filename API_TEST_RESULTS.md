# API Test Results

Manual checklist for exam testing:

- Register rejects missing fields, weak passwords, invalid email, and duplicate email.
- Register sends OTP and creates an unverified account.
- Login rejects unverified accounts.
- Verify email rejects invalid/expired OTP and accepts valid OTP.
- Login creates an HttpOnly cookie after verification.
- Protected routes reject unauthenticated requests.
- Admin-only routes reject inspector/user roles.
- Duplicate extinguisher serial numbers are rejected.
- Report CSV and PDF export endpoints respond successfully.
- Frontend confirms logout and delete actions.
- API gateway `/api/*` routes forward to the correct service containers.
- Each microservice responds on its assigned port and `/health` endpoint.
