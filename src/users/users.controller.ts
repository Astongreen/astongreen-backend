import { Body, Controller, HttpCode, HttpStatus, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { Messages } from 'src/common/constants/messages';
import { CONTROLLERS, INERNAL_ROUTES } from 'src/common/constants/utils';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller(CONTROLLERS.USERS)
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @HttpCode(HttpStatus.OK)
    @ResponseMessage(Messages.USERS.PASSWORD_CHANGED)
    @Post(INERNAL_ROUTES.USERS.CHANGE_PASSWORD)
    async changePassword(@Body() dto: ChangePasswordDto, @Req() req: Request) {
        const userId = (req as any)['auth'].userId as string;
        await this.usersService.changePassword(userId, dto.currentPassword, dto.newPassword);
        return { ok: true };
    }

    @HttpCode(HttpStatus.OK)
    @ResponseMessage(Messages.USERS.PROFILE_UPDATED)
    @Patch(INERNAL_ROUTES.USERS.UPDATE_PROFILE)
    async updateProfile(@Body() dto: UpdateProfileDto, @Req() req: Request) {
        const userId = (req as any)['auth'].userId as string;
        const updated = await this.usersService.updateProfile(userId, dto);
        return updated;
    }
}


