import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

export const ApiAdminController = () => ApiTags('admin');

export const ApiAdminCreateCompany = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: Register a new company' }),
    ApiResponse({ status: 201, description: 'Company created' }),
  );

export const ApiAdminUpdateCompany = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: Update a company' }),
    ApiResponse({ status: 200, description: 'Company updated' }),
  );

export const ApiAdminGetCompanies = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: List companies' }),
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' }),
    ApiResponse({ status: 200, description: 'Companies fetched' }),
  );

export const ApiAdminGetCompanyById = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: Get company by ID' }),
    ApiResponse({ status: 200, description: 'Company fetched' }),
  );


