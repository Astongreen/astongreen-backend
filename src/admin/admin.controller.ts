import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CompaniesService } from 'src/companies/companies.service';
import { CreateCompanyDto } from 'src/companies/dto/create-company.dto';
import { UpdateCompanyDto } from 'src/companies/dto/update-company.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { Messages } from '../common/constants/messages';
import { ApiAdminApproveOrRejectCompany, ApiAdminApproveOrRejectProject, ApiAdminController, ApiAdminCreateCompany, ApiAdminCreateProject, ApiAdminGetAllApprovedCompanies, ApiAdminGetCompanies, ApiAdminGetCompanyById, ApiAdminGetProjectById, ApiAdminGetProjects, ApiAdminGetProjectsByCompanyId, ApiAdminGetProjectsByProjectType, ApiAdminUpdateCompany, ApiAdminUpdateProject } from './admin.swagger';
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

@ApiAdminController()
@ApiBearerAuth('access-token')
@Controller(CONTROLLERS.ADMIN)
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly companiesService: CompaniesService,
    private readonly projectsService: ProjectsService,
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
  @ResponseMessage(Messages.ADMIN.PROJECT_GET_BY_COMPANY_ID)
  @Get(INERNAL_ROUTES.ADMIN.PROJECT_GET_BY_COMPANY_ID)
  async getProjectsByCompanyId(@Param('companyId') companyId: string) {
    return await this.projectsService.getProjectsByCompanyId(companyId);
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


}


