import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { Messages } from '../common/constants/messages';
import { ApiAuthController, ApiAuthSignup, ApiAuthLogin, ApiAuthForgotPassword, ApiAuthResetPassword } from './auth.swagger';
import { CONTROLLERS, INERNAL_ROUTES } from 'src/common/constants/utils';

@ApiAuthController()
@Controller(CONTROLLERS.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiAuthSignup()
  @ResponseMessage(Messages.AUTH.SIGNUP_SUCCESS)
  @Post(INERNAL_ROUTES.AUTH.SIGNUP)
  async signup(@Body() dto: SignupDto) {
    return await this.authService.signup(dto);
  }

  @ApiAuthLogin()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.AUTH.LOGIN_SUCCESS)
  @Post(INERNAL_ROUTES.AUTH.LOGIN)
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @ApiAuthForgotPassword()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.AUTH.FORGOT_PASSWORD_SENT)
  @Post(INERNAL_ROUTES.AUTH.FORGOT_PASSWORD)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { ok: true };
  }

  @ApiAuthResetPassword()
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(Messages.AUTH.RESET_PASSWORD_SUCCESS)
  @Post(INERNAL_ROUTES.AUTH.RESET_PASSWORD)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.email, dto.otpCode, dto.newPassword);
    return { ok: true };
  }
}


