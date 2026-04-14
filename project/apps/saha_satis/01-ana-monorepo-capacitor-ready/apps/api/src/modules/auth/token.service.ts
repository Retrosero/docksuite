import { Injectable, UnauthorizedException } from "@nestjs/common";
import { createHmac } from "node:crypto";
import type { AuthenticatedUser } from "../../shared/http/request-context";

interface TokenPayload extends AuthenticatedUser {
  exp: number;
}

@Injectable()
export class TokenService {
  private readonly ttlSeconds = 60 * 60 * 8;

  sign(user: AuthenticatedUser): string {
    const payload: TokenPayload = {
      ...user,
      exp: Math.floor(Date.now() / 1000) + this.ttlSeconds
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = this.signWithSecret(encodedPayload);
    return `${encodedPayload}.${signature}`;
  }

  verify(token: string): AuthenticatedUser {
    const [payloadPart, signaturePart] = token.split(".");
    if (!payloadPart || !signaturePart) {
      throw new UnauthorizedException("Geçersiz token formatı.");
    }

    const expectedSignature = this.signWithSecret(payloadPart);
    if (expectedSignature !== signaturePart) {
      throw new UnauthorizedException("Token imzası doğrulanamadı.");
    }

    const payloadText = Buffer.from(payloadPart, "base64url").toString("utf8");
    const payload = JSON.parse(payloadText) as TokenPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException("Token süresi doldu.");
    }

    return {
      userId: payload.userId,
      tenantId: payload.tenantId,
      tenantSlug: payload.tenantSlug,
      roles: payload.roles,
      permissions: payload.permissions
    };
  }

  private signWithSecret(raw: string): string {
    const secret = process.env.AUTH_TOKEN_SECRET ?? "";
    return createHmac("sha256", secret).update(raw).digest("base64url");
  }
}
