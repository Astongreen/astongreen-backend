import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProjectDto } from '../projects/dto/create-project.dto';
import { UpdateProjectDto } from '../projects/dto/update-project.dto';
import { AddNewUserDto } from './dto/user.dto';
import { UpdateRolePermissionsDto } from './dto/permissions.dto';
import { Permission } from 'src/common/enums/permission.enum';

export const ApiAdminController = () =>
  applyDecorators(ApiTags('admin'), ApiBearerAuth('access-token'));

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
    ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' }),
    ApiQuery({ name: 'country', required: false, type: String, description: 'Filter by country' }),
    ApiQuery({ name: 'search', required: false, type: String, description: 'Free text search across company fields' }),
    ApiResponse({ status: 200, description: 'Companies fetched' }),
  );

export const ApiAdminGetAllApprovedCompanies = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: List approved companies' }),
    ApiResponse({ status: 200, description: 'Approved companies fetched' }),
  );

export const ApiAdminGetCompanyById = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: Get company by ID' }),
    ApiResponse({ status: 200, description: 'Company fetched' }),
  );

export const ApiAdminApproveOrRejectCompany = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: Approve or reject a company' }),
    ApiResponse({ status: 200, description: 'Company approval status updated' }),
  );

// Project management
export const ApiAdminCreateProject = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: Create a project' }),
    ApiResponse({ status: 201, description: 'Project created' }),
    ApiBody({
      type: CreateProjectDto,
      examples: {
        default: {
          summary: 'Create project payload',
          value: {
            basicInfo: {
              projectName: 'Hydro Power Project',
              projectCode: 'HYDRO-2025-01',
              typeOfProject: 'Hydrogen',
              legalSpvName: 'Mahindra Hydro Energy Pvt. Ltd',
              companyId: '6e0d7f7a-9c3c-4d2c-8c21-1e7a2c4a9f11'
            },
            details: {
              dateOfCommissioningExpected: '1763460135',
              tariff: 0.075,
              creditRatingOfCharter: 'AAA (CRISIL)',
              internalCreditRating: 'Green Premium',
              concessionAgreementTenure: '25 Years',
              locationCoordinates: '27.57°N, 76.10°E',
              nameOfCharter: 'NTPC Limited',
              projectCapacity: '500 MW',
              externalCreditRating: 'A+'
            },
            capital: {
              paidUpEquityCapital: 20000000,
              debtFromBanks: 60000000,
              tenureOfDebtYears: 8,
              interestRatePercent: 6.9,
              dscr: 1.25,
              prbPreTaxPercent: 12.5,
              totalSharesSubscribed: 5000000,
              currentBookValuePerShare: 210,
              capitalRaisedByPromoters: 10000000
            },
            co2Registry: {
              registryName: 'Gold Standard Registry',
              registryProjectId: 'GS-PROJ-NO-2027-001',
              dateOfPddRegistration: '1763460135',
              co2IssuedSoFar: 1200000,
              registeredMitigationOutcome: true
            },
            tokenization: {
              investmentTokenChosen: 'Debt Token',
              interestInListing: 'Yes',
              dcoRegistrationServiceProvided: true,
              co2ServicesPerformed: true,
              keyProjectDocuments: ['Feasibility Report', 'PDD Report'],
              tokenConversionRule: '1 Equity Share = 10,000 Tokens',
              tokenPrice: 1.02,
              tokenPriceCurrency: 'USD'
            }
          }
        }
      }
    }),
  );

export const ApiAdminUpdateProject = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: Update a project' }),
    ApiResponse({ status: 200, description: 'Project updated' }),
    ApiBody({
      type: UpdateProjectDto,
      examples: {
        default: {
          summary: 'Update project payload',
          value: {
            basicInfo: {
              projectName: 'Hydro Power Project - Phase 1',
              projectCode: 'HYDRO-2025-01',
              typeOfProject: 'Hydrogen',
              legalSpvName: 'Mahindra Hydro Energy Pvt. Ltd',
              companyId: '6e0d7f7a-9c3c-4d2c-8c21-1e7a2c4a9f11'
            },
            details: {
              dateOfCommissioningExpected: '1763460135',
              tariff: 0.08,
              creditRatingOfCharter: 'AAA (CRISIL)',
              internalCreditRating: 'Green Premium',
              concessionAgreementTenure: '25 Years',
              locationCoordinates: '27.57°N, 76.10°E',
              nameOfCharter: 'NTPC Limited',
              projectCapacity: '500 MW',
              externalCreditRating: 'A+'
            },
            capital: {
              paidUpEquityCapital: 22000000,
              debtFromBanks: 62000000,
              tenureOfDebtYears: 8,
              interestRatePercent: 7.1,
              dscr: 1.28,
              prbPreTaxPercent: 12.8,
              totalSharesSubscribed: 5200000,
              currentBookValuePerShare: 215,
              capitalRaisedByPromoters: 11000000
            },
            co2Registry: {
              registryName: 'Gold Standard Registry',
              registryProjectId: 'GS-PROJ-NO-2027-001',
              dateOfPddRegistration: '1763460135',
              co2IssuedSoFar: 1300000,
              registeredMitigationOutcome: true
            },
            tokenization: {
              investmentTokenChosen: 'Debt Token',
              interestInListing: 'Yes',
              dcoRegistrationServiceProvided: true,
              co2ServicesPerformed: true,
              keyProjectDocuments: ['Feasibility Report', 'PDD Report'],
              tokenConversionRule: '1 Equity Share = 10,000 Tokens',
              tokenPrice: 1.05,
              tokenPriceCurrency: 'USD'
            }
          }
        }
      }
    }),
  );

export const ApiAdminGetProjects = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: List projects' }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
    ApiResponse({ status: 200, description: 'Projects fetched' }),
  );

export const ApiAdminGetProjectById = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: Get project by ID' }),
    ApiResponse({ status: 200, description: 'Project fetched' }),
  );

export const ApiAdminApproveOrRejectProject = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: Approve or reject a project' }),
    ApiResponse({ status: 200, description: 'Project approval status updated' }),
  );

export const ApiAdminGetProjectsByCompanyId = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: List projects by company ID' }),
    ApiQuery({ name: 'projectType', required: false, type: String, description: 'Filter projects by project type' }),
    ApiResponse({ status: 200, description: 'Projects fetched by company ID' }),
  );

export const ApiAdminGetProjectsByProjectType = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: List projects by project type' }),
    ApiResponse({ status: 200, description: 'Projects fetched by project type' }),
  );

export const ApiAdminAddNewUser = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: Add a new user' }),
    ApiBody({ type: AddNewUserDto }),
    ApiResponse({ status: 201, description: 'User added' }),
  );

// Role permissions management
export const ApiAdminListRolePermissions = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: List role permissions (all roles)' }),
    ApiResponse({ status: 200, description: 'Role permissions fetched' }),
  );

export const ApiAdminGetRolePermissions = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: Get permissions for a role' }),
    ApiResponse({ status: 200, description: 'Role permissions fetched' }),
  );

export const ApiAdminUpdateRolePermissions = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: Update permissions for a role' }),
    ApiBody({ type: UpdateRolePermissionsDto }),
    ApiResponse({ status: 200, description: 'Role permissions updated' }),
  );

export const ApiAdminGetAllUsers = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: List users' }),
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' }),
    ApiQuery({ name: 'role', required: false, type: String, description: 'Filter by role' }),
    ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name/email' }),
    ApiResponse({ status: 200, description: 'Users fetched' }),
  );

export const ApiAdminGetUserById = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin: Get user by ID' }),
    ApiParam({ name: 'id', type: String, description: 'User ID' }),
    ApiResponse({ status: 200, description: 'User fetched' }),
  );


