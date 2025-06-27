/**
 * Guard para proteger rutas usando JWT.
 * 
 * Este guard extiende `AuthGuard('jwt')` de Passport y se usa junto con
 * la estrategia `JwtStrategy`. Su propósito es verificar que el token JWT
 * esté presente, sea válido y no haya expirado.
 * 
 * Uso típico:
 * - Se aplica con el decorador `@UseGuards(JwtAuthGuard)` en rutas que requieren autenticación.
 */


import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}