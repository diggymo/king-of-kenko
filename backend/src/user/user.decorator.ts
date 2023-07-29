import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type UserType = { userId: string; email: string };

export const AuthorizedUser = createParamDecorator<any, any, UserType>((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
