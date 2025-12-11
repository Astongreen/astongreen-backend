import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TokenService } from './token.service';
import { CONTROLLERS, INERNAL_ROUTES } from 'src/common/constants/utils';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/role.enum';
import { QueryTransformOptions } from 'src/common/middlewares/query-transform/query-transform.interface';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Messages } from 'src/common/constants/messages';
import { GetAllTokensDto } from './dto/token.dto';
import { ApiCreateToken, ApiDeleteToken, ApiGetAllTokens, ApiUpdateToken } from './token.swagger';

@ApiTags('token')
@Controller(CONTROLLERS.TOKEN)
// @ApiBearerAuth('access-token')
// @UseGuards(JwtAuthGuard)
// @Roles(UserRole.SUPER_ADMIN)
export class TokenController {
  constructor(private readonly tokenService: TokenService) { }

  @Get(INERNAL_ROUTES.TOKEN.HEALTH)
  async health() {
    return await this.tokenService.health();
  }

  @ApiCreateToken()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(Messages.TOKEN.TOKEN_CREATED)
  @Post(INERNAL_ROUTES.TOKEN.CREATE)
  async create(@Body() dto: CreateTokenDto) {
    return await this.tokenService.create(dto);
  }

  @ApiUpdateToken()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.TOKEN.TOKEN_UPDATED)
  @Patch(INERNAL_ROUTES.TOKEN.UPDATE)
  async update(@Param('id') id: string, @Body() dto: UpdateTokenDto) {
    return await this.tokenService.update(id, dto);
  }

  @ApiDeleteToken()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(INERNAL_ROUTES.TOKEN.DELETE)
  async remove(@Param('id') id: string) {
    await this.tokenService.remove(id);
  }

  @ApiGetAllTokens()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.TOKEN.TOKENS_GET_ALL)
  @Get(INERNAL_ROUTES.TOKEN.GET_ALL)
  async getAllTokens(@Req() req: Request, @Query() query: GetAllTokensDto) {
    let whereCondition: Record<string, any> = {};
    if (query.status) {
      whereCondition.status = query.status;
    }

    if (query.tokenType) {
      whereCondition.tokenType = query.tokenType;
    }

    if (query.companyId) {
      whereCondition.companyId = query.companyId;
    }

    return await this.tokenService.getAllTokens(whereCondition, (req as any)['modifiedQuery'],);
  }

}


