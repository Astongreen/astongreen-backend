import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';
import { Permission } from 'src/common/enums/permission.enum';

export class UpdateRolePermissionsDto {
  @ApiProperty({
    enum: Permission,
    isArray: true,
    description: 'List of permissions to assign to the role',
    example: [
      'PDD_MANAGEMENT',
      'COMPANY_MANAGEMENT',
      'PROJECT_MANAGEMENT',
      'TOKEN_MANAGEMENT',
      'USER_MANAGEMENT',
      'ROLE_MANAGEMENT',
      'REVIEW_REQUEST',
    ],
  })
  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions: Permission[];
}


