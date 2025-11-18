export const CONTROLLERS = {
    ADMIN: 'admin',
    AUTH: 'auth',
    COMPANIES: 'companies',
    USERS: 'users',
} as const;

export const INERNAL_ROUTES = {
    ADMIN: {
        HEALTH: 'health',
        COMPANY_CREATE: 'companies',
        COMPANY_UPDATE: 'companies/:id',
        COMPANY_GET_ALL: 'companies',
        COMPANY_GET_BY_ID: 'companies/:id',
        COMPANY_GET_ALL_APPROVED: 'companies/approved/all',
        COMPANY_APPROVE_OR_REJECT: 'companies/:id/approve-or-reject',
        PROJECT_CREATE: 'projects',
        PROJECT_UPDATE: 'projects/:id',
        PROJECT_GET_ALL: 'projects',
        PROJECT_GET_BY_ID: 'projects/:id',
        PROJECT_APPROVE_OR_REJECT: 'projects/:id/approve-or-reject',
    },
    AUTH: {
        SIGNUP: 'signup',
        LOGIN: 'login',
        FORGOT_PASSWORD: 'forgot-password',
        RESET_PASSWORD: 'reset-password',
    },
} as const;