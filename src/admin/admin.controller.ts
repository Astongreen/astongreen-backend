import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CompaniesService } from 'src/companies/companies.service';
import { CreateCompanyDto } from 'src/companies/dto/create-company.dto';
import { UpdateCompanyDto } from 'src/companies/dto/update-company.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { Messages } from '../common/constants/messages';
import { ApiAdminAddNewUser, ApiAdminApproveOrRejectCompany, ApiAdminApproveOrRejectProject, ApiAdminController, ApiAdminCreateCompany, ApiAdminCreateProject, ApiAdminGetAllApprovedCompanies, ApiAdminGetCompanies, ApiAdminGetCompanyById, ApiAdminGetProjectById, ApiAdminGetProjects, ApiAdminGetProjectsByCompanyId, ApiAdminGetProjectsByProjectType, ApiAdminListRolePermissions, ApiAdminGetRolePermissions, ApiAdminUpdateRolePermissions, ApiAdminGetAllUsers, ApiAdminGetUserById, ApiAdminUpdateCompany, ApiAdminUpdateProject } from './admin.swagger';
import { CONTROLLERS, INERNAL_ROUTES } from 'src/common/constants/utils';
import { ApproveOrRejectCompanyDto, GetAllCompaniesDto } from './dto/companies.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ProjectType, UserRole } from 'src/common/enums/role.enum';
import { CompanyStatus } from 'src/companies/types/company.enum';
import { ProjectsService } from 'src/projects/projects.service';
import { CreateProjectDto } from 'src/projects/dto/create-project.dto';
import { UpdateProjectDto } from 'src/projects/dto/update-project.dto';
import { ProjectStatus } from 'src/projects/types/project.enum';
import { AddNewUserDto, GetAllUsersDto } from './dto/user.dto';
import { RbacService } from 'src/rbac/rbac.service';
import { Permission } from 'src/common/enums/permission.enum';
import { Not } from 'typeorm';
// duplicates removed

@ApiAdminController()
@ApiBearerAuth('access-token')
@Controller(CONTROLLERS.ADMIN)
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly companiesService: CompaniesService,
    private readonly projectsService: ProjectsService,
    private readonly rbacService: RbacService,
  ) { }

  @Get('health')
  health() {
    return this.adminService.getHealth();
  }

  // Projects
  @ApiAdminCreateProject()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(Messages.ADMIN.PROJECT_CREATED)
  @Post(INERNAL_ROUTES.ADMIN.PROJECT_CREATE)
  async createProject(@Body() dto: CreateProjectDto, @Req() req: Request) {
    const userId = (req as any)['auth'].userId as string;
    const isSuperAdmin = await this.adminService.checkUserIsSuperAdmin(userId);
    return await this.projectsService.create({ ...dto, status: isSuperAdmin ? ProjectStatus.APPROVED : ProjectStatus.PENDING }, userId);
  }

  @ApiAdminUpdateProject()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.PROJECT_UPDATED)
  @Patch(INERNAL_ROUTES.ADMIN.PROJECT_UPDATE)
  async updateProject(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return await this.projectsService.update(id, dto);
  }

  @ApiAdminGetProjectById()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.PROJECT_GET_BY_ID)
  @Get(INERNAL_ROUTES.ADMIN.PROJECT_GET_BY_ID)
  async getProjectById(@Param('id') id: string) {
    return await this.projectsService.getProjectById(id);
  }

  @ApiAdminGetProjects()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.PROJECT_GET_ALL)
  @Get(INERNAL_ROUTES.ADMIN.PROJECT_GET_ALL)
  @ApiQuery({ name: 'companyId', required: false, type: String, description: 'Filter projects by company ID' })
  async getAllProjects(@Req() req: Request, @Query() companyId: string) {
    let whereCondition: Record<string, any> = {};
    if (companyId) {
      whereCondition.companyId = companyId;
    }
    return await this.projectsService.getAllProjects(whereCondition, (req as any)['modifiedQuery'],);
  }

  @ApiAdminGetProjectsByCompanyId()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'projectType', required: false, enum: ProjectType, description: 'Optional project type filter' })
  @ResponseMessage(Messages.ADMIN.PROJECT_GET_BY_COMPANY_ID)
  @Get(INERNAL_ROUTES.ADMIN.PROJECT_GET_BY_COMPANY_ID)
  async getProjectsByCompanyId(@Param('companyId') companyId: string, @Query('projectType') projectType?: ProjectType) {
    return await this.projectsService.getProjectsByCompanyId(companyId, projectType);
  }

  @ApiAdminGetProjectsByProjectType()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.PROJECT_GET_BY_PROJECT_TYPE)
  @Get(INERNAL_ROUTES.ADMIN.PROJECT_GET_BY_PROJECT_TYPE)
  async getProjectsByProjectType(@Param('projectType') projectType: ProjectType) {
    return await this.projectsService.getProjectsByProjectType(projectType);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @ApiAdminApproveOrRejectProject()
  @HttpCode(HttpStatus.OK)
  @Patch(INERNAL_ROUTES.ADMIN.PROJECT_APPROVE_OR_REJECT)
  async approveOrRejectProject(@Param('id') id: string, @Body() dto: { status: ProjectStatus; rejectReason?: string }) {
    const result = await this.projectsService.approveOrRejectProject({ id, status: dto.status as ProjectStatus, rejectReason: dto.rejectReason });
    const dynamicMessage = dto.status === ProjectStatus.APPROVED ? Messages.ADMIN.PROJECT_APPROVED : Messages.ADMIN.PROJECT_REJECTED;
    return { message: dynamicMessage, ...result };
  }

  @ApiAdminCreateCompany()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(Messages.ADMIN.COMPANY_CREATED)
  @Post(INERNAL_ROUTES.ADMIN.COMPANY_CREATE)
  async createCompany(@Body() dto: CreateCompanyDto, @Req() req: Request) {
    const userId = (req as any)['auth'].userId as string;
    console.log('userId', userId);
    const checkUserIsSuperAdmin = await this.adminService.checkUserIsSuperAdmin(userId);
    return await this.companiesService.create({ ...dto, status: checkUserIsSuperAdmin ? CompanyStatus.APPROVED : CompanyStatus.PENDING }, userId);
  }

  @ApiAdminUpdateCompany()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.COMPANY_UPDATED)
  @Patch(INERNAL_ROUTES.ADMIN.COMPANY_UPDATE)
  async updateCompany(@Param('id') id: string, @Body() dto: UpdateCompanyDto, @Req() req: Request) {
    const userId = (req as any)['auth'].userId as string;
    const checkUserIsSuperAdmin = await this.adminService.checkUserIsSuperAdmin(userId);
    return await this.companiesService.update(id, dto, userId, checkUserIsSuperAdmin);
  }

  @ApiAdminGetCompanyById()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.COMPANY_GET_BY_ID)
  @Get(INERNAL_ROUTES.ADMIN.COMPANY_GET_BY_ID)
  async getCompanyById(@Param('id') id: string) {
    return await this.companiesService.getCompanyById(id);
  }

  @ApiAdminGetAllApprovedCompanies()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.COMPANY_GET_ALL_APPROVED)
  @Get(INERNAL_ROUTES.ADMIN.COMPANY_GET_ALL_APPROVED)
  async getAllApprovedCompanies() {
    return await this.companiesService.getAllApprovedCompanies();
  }

  // -------- Role Permissions management (SUPER_ADMIN only) --------
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.ROLE_PERMISSIONS_GET_ALL_SUCCESSFULLY)
  @ApiAdminListRolePermissions()
  @Get('role-permissions')
  async getAllRolePermissions() {
    return await this.rbacService.getAll();
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.ROLE_PERMISSIONS_GET_SUCCESSFULLY)
  @ApiAdminGetRolePermissions()
  @Get('role-permissions/:role')
  async getRolePermissions(@Param('role') role: UserRole) {
    return await this.rbacService.getByRole(role as UserRole);
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.ROLE_PERMISSIONS_UPDATED_SUCCESSFULLY)
  @ApiAdminUpdateRolePermissions()
  @Patch('role-permissions/:role')
  async updateRolePermissions(@Param('role') role: UserRole, @Body() body: import('./dto/permissions.dto').UpdateRolePermissionsDto) {
    return await this.rbacService.upsert(role as UserRole, (body?.permissions ?? []) as Permission[]);
  }


  @ApiAdminGetCompanies()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.COMPANY_GET_ALL)
  @Get(INERNAL_ROUTES.ADMIN.COMPANY_GET_ALL)
  async getAllCompanies(@Req() req: Request, @Query() query: GetAllCompaniesDto) {
    let whereCondition: Record<string, any> = {};
    if (query.country) {
      whereCondition.country = query.country;
    }
    if (query.status) {
      whereCondition.status = query.status;
    }
    return await this.companiesService.getAllCompanies(whereCondition, (req as any)['modifiedQuery'],);
  }

  @Roles(UserRole.SUPER_ADMIN)
  @ApiAdminApproveOrRejectCompany()
  @HttpCode(HttpStatus.OK)
  @Patch(INERNAL_ROUTES.ADMIN.COMPANY_APPROVE_OR_REJECT)
  async approveOrRejectCompany(@Param('id') id: string, @Body() dto: ApproveOrRejectCompanyDto) {
    const result = await this.companiesService.approveOrRejectCompany({ id, status: dto.status as CompanyStatus, rejectReason: dto.rejectReason });
    const dynamicMessage =
      dto.status === CompanyStatus.APPROVED
        ? Messages.ADMIN.COMPANY_APPROVED
        : Messages.ADMIN.COMPANY_REJECTED;
    return { message: dynamicMessage, ...result };
  }

  @ApiAdminAddNewUser()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(Messages.ADMIN.USER_ADDED)
  @Post(INERNAL_ROUTES.ADMIN.USER_ADD)
  async addNewUser(@Body() dto: AddNewUserDto) {
    return await this.adminService.addNewUser(dto);
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.USER_UPDATED)
  @Patch('user/:id')
  async updateUser(@Param('id') id: string, @Body() dto: import('./dto/user.dto').UpdateUserDto) {
    return await this.adminService.updateUser(id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.USER_BLOCKED)
  @Patch('user/:id/block')
  async blockUser(@Param('id') id: string) {
    return await this.adminService.setUserBlocked(id, { isBlocked: true });
  }

  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.USER_UNBLOCKED)
  @Patch('user/:id/unblock')
  async unblockUser(@Param('id') id: string) {
    return await this.adminService.setUserBlocked(id, { isBlocked: false });
  }

  @ApiAdminGetAllUsers()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.USER_GET_ALL)
  @Get(INERNAL_ROUTES.ADMIN.USER_GET_ALL)
  async getAllUsers(@Req() req: Request, @Query() query: GetAllUsersDto) {
    let whereCondition: Record<string, any> = {
      role: Not(UserRole.SUPER_ADMIN)
    };
    if (query.role) {
      whereCondition.role = query.role;
    }
    return await this.adminService.getAllUsers(whereCondition, (req as any)['modifiedQuery'],);
  }

  @ApiAdminGetUserById()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.USER_GET_BY_ID)
  @Get(INERNAL_ROUTES.ADMIN.USER_GET_BY_ID)
  async getUserById(@Param('id') id: string) {
    return await this.adminService.getUserById(id);
  }


}


