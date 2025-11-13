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
    },
    AUTH: {
        SIGNUP: 'signup',
        LOGIN: 'login',
        FORGOT_PASSWORD: 'forgot-password',
        RESET_PASSWORD: 'reset-password',
    },
} as const;