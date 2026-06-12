import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

interface IPermission {
  moduleId: number;
  moduleName: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    userId: number;
    userName: string;
    role: string;
    roleId: number;
    restaurantId: number[];
    permissions: IPermission[];
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
  }
}

declare module 'next-auth' {
  interface User extends DefaultUser {
    userId: number;
    userName: string;
    role: string;
    roleId: number;
    restaurantId: number[];
    permissions: IPermission[];
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
  }

  interface Session {
    user: {
      id: string; 
      userId: number;
      userName: string;
      role: string;
      roleId: number;
      restaurantId: number[];
      permissions: IPermission[];
      accessToken: string;
    } & DefaultSession['user'];
  }
}