import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';

export const ApiTokenController = () =>
  applyDecorators(ApiTags('token'), ApiBearerAuth('access-token'));

export const ApiCreateToken = () =>
  applyDecorators(
    ApiOperation({ summary: 'Token: Create token' }),
    ApiBody({ type: CreateTokenDto }),
    ApiResponse({ status: 201, description: 'Token created' }),
  );

export const ApiUpdateToken = () =>
  applyDecorators(
    ApiOperation({ summary: 'Token: Update token' }),
    ApiBody({ type: UpdateTokenDto }),
    ApiResponse({ status: 200, description: 'Token updated' }),
  );

export const ApiDeleteToken = () =>
  applyDecorators(
    ApiOperation({ summary: 'Token: Delete token' }),
    ApiResponse({ status: 204, description: 'Token deleted' }),
  );

export const ApiGetAllTokens = () =>
  applyDecorators(
    ApiOperation({ summary: 'Token: List tokens' }),
    ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' }),
    ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' }),
    ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by token status' }),
    ApiResponse({ status: 200, description: 'Tokens fetched' }),
  );


