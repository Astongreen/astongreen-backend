import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CompaniesService } from 'src/companies/companies.service';
import { CreateCompanyDto } from 'src/companies/dto/create-company.dto';
import { UpdateCompanyDto } from 'src/companies/dto/update-company.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { Messages } from '../common/constants/messages';
import { ApiAdminController, ApiAdminCreateCompany, ApiAdminGetCompanies, ApiAdminGetCompanyById, ApiAdminUpdateCompany } from './admin.swagger';
import { CONTROLLERS, INERNAL_ROUTES } from 'src/common/constants/utils';
import { GetAllCompaniesDto } from './dto/companies.dto';

@ApiAdminController()
@Controller(CONTROLLERS.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly companiesService: CompaniesService,
  ) { }

  @Get('health')
  health() {
    return this.adminService.getHealth();
  }

  @ApiAdminCreateCompany()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(Messages.ADMIN.COMPANY_CREATED)
  @Post(INERNAL_ROUTES.ADMIN.COMPANY_CREATE)
  async createCompany(@Body() dto: CreateCompanyDto) {
    return await this.companiesService.create(dto);
  }

  @ApiAdminUpdateCompany()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.COMPANY_UPDATED)
  @Patch(INERNAL_ROUTES.ADMIN.COMPANY_UPDATE)
  async updateCompany(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return await this.companiesService.update(id, dto);
  }

  @ApiAdminGetCompanyById()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.ADMIN.COMPANY_GET_BY_ID)
  @Get(INERNAL_ROUTES.ADMIN.COMPANY_GET_BY_ID)
  async getCompanyById(@Param('id') id: string) {
    return await this.companiesService.getCompanyById(id);
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
    return await this.companiesService.getAllCompanies(whereCondition, (req as any)['modifiedQuery'],);
  }
}


