import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthRepository } from "./auth.repository";
import type { LoginDto } from "./dto/login.dto";
import { TokenService } from "./token.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService
  ) {}

  login(dto: LoginDto, tenantId: string): { accessToken: string } {
    const user = this.authRepository.findByCredentials(
      tenantId,
      dto.email,
      dto.password
    );

    if (!user) {
      throw new UnauthorizedException("Kullanıcı adı veya şifre hatalı.");
    }

    const accessToken = this.tokenService.sign({
      userId: user.userId,
      tenantId,
      roles: user.roles,
      permissions: user.permissions
    });

    return { accessToken };
  }
}
