export const Messages = {
  GENERIC: {
    SUCCESS: 'Request successful',
    FAILURE: 'Request failed',
  },
  AUTH: {
    SIGNUP_SUCCESS: 'Signup successful',
    LOGIN_SUCCESS: 'Login successful',
    FORGOT_PASSWORD_SENT: 'If the email exists, an OTP has been sent',
    RESET_PASSWORD_SUCCESS: 'Password reset successful',
  },
  ADMIN: {
    COMPANY_CREATED: 'Company created successfully',
    COMPANY_UPDATED: 'Company updated successfully',
    COMPANY_GET_ALL: 'Companies fetched successfully',
    COMPANY_GET_BY_ID: 'Company fetched successfully',
  },
} as const;

export const Errors = {
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid credentials',
  },
  COMPANY: {
    COMPANY_NOT_FOUND: 'Company not found',
    COMPANY_ALREADY_EXISTS: 'Company with this registration number already exists',
  },
} as const;
