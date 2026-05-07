import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AppJwtService {
  constructor(private jwt: JwtService) {}

  sign(payload: any) {
    return this.jwt.sign(payload);
  }

  verify(token: string) {
    return this.jwt.verify(token);
  }
}
