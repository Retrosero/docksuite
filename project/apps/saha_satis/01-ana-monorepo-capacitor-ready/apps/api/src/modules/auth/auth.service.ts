import { Injectable, UnauthorizedException } from "@nestjs/common";
import { compare } from "bcryptjs";
import { AuthRepository } from "./auth.repository";
import type { LoginDto } from "./dto/login.dto";
import { TokenService } from "./token.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService
  ) {}

  async login(dto: LoginDto, tenantId: string): Promise<{ accessToken: string }> {
    const user = await this.authRepository.findByCredentials(tenantId, dto.email);

    if (!user?.passwordHash) {
      throw new UnauthorizedException("Kullanıcı adı veya şifre hatalı.");
    }
    const isPasswordValid = await compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Kullanıcı adı veya şifre hatalı.");
    }

    const accessToken = this.tokenService.sign({
      userId: user.userId,
      tenantId: user.tenantId,
      tenantSlug: user.tenantSlug,
      roles: user.roles,
      permissions: user.permissions
    });

    return { accessToken };
  }
}
