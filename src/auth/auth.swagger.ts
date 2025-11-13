import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export const ApiAuthController = () => ApiTags('auth');

export const ApiAuthSignup = () =>
    applyDecorators(
        ApiOperation({ summary: 'Investor signup' }),
        ApiResponse({ status: 201, description: 'User created' }),
    );

export const ApiAuthLogin = () =>
    applyDecorators(
        ApiOperation({ summary: 'Login' }),
        ApiResponse({ status: 200, description: 'Login successful' }),
    );

export const ApiAuthForgotPassword = () =>
    applyDecorators(
        ApiOperation({ summary: 'Request password reset OTP' }),
        ApiResponse({ status: 200, description: 'OTP sent if email exists' }),
    );

export const ApiAuthResetPassword = () =>
    applyDecorators(
        ApiOperation({ summary: 'Reset password with OTP' }),
        ApiResponse({ status: 200, description: 'Password reset successful' }),
    );


