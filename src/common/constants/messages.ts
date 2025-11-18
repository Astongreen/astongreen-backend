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
    COMPANY_APPROVED_OR_REJECTED: 'Company approved or rejected successfully',
    COMPANY_APPROVED: 'Company approved successfully',
    COMPANY_REJECTED: 'Company rejected successfully',
    PROJECT_CREATED: 'Project created successfully',
    PROJECT_UPDATED: 'Project updated successfully',
    PROJECT_GET_ALL: 'Projects fetched successfully',
    PROJECT_GET_BY_ID: 'Project fetched successfully',
    PROJECT_APPROVED_OR_REJECTED: 'Project approved or rejected successfully',
    PROJECT_APPROVED: 'Project approved successfully',
    PROJECT_REJECTED: 'Project rejected successfully',
    COMPANY_GET_ALL_APPROVED: 'All approved companies fetched successfully',
  },
} as const;

export const Errors = {
  USER: {
    EMAIL_ALREADY_IN_USE: 'Email already in use',
    USER_NOT_FOUND: 'User not found',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid credentials',
  },
  COMPANY: {
    COMPANY_NOT_FOUND: 'Company not found',
    COMPANY_ALREADY_EXISTS: 'Company with this registration number already exists',
    COMPANY_WITH_THIS_VAT_NUMBER_ALREADY_EXISTS: 'Company with this VAT number already exists',
    COMPANY_ALREADY_APPROVED: 'Company already approved',
    COMPANY_NOT_ALLOWED_TO_UPDATE: 'You are not allowed to update this company',
  },
  PROJECT: {
    PROJECT_NOT_FOUND: 'Project not found',
  },
} as const;
