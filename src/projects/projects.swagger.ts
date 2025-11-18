import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export const ApiProjectsController = () => applyDecorators(ApiTags('projects'));


