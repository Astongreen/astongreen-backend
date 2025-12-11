export const CONTROLLERS = {
    ADMIN: 'admin',
    AUTH: 'auth',
    COMPANIES: 'companies',
    USERS: 'users',
    TOKEN: 'token',
} as const;

export const INERNAL_ROUTES = {
    ADMIN: {
        HEALTH: 'health',
        USER_ADD: 'users',
        USER_GET_ALL: 'users',
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
        PROJECT_GET_BY_COMPANY_ID: 'projects/company/:companyId',
        PROJECT_GET_BY_PROJECT_TYPE: 'projects/type/:projectType',
    },
    AUTH: {
        SIGNUP: 'signup',
        LOGIN: 'login',
        FORGOT_PASSWORD: 'forgot-password',
        RESET_PASSWORD: 'reset-password',
    },
    USERS: {
        CHANGE_PASSWORD: 'change-password',
        UPDATE_PROFILE: 'profile',
    },
    TOKEN: {
        HEALTH: 'health',
        CREATE: '',
        UPDATE: ':id',
        DELETE: ':id',
        GET_ALL: 'all',
    },
} as const;