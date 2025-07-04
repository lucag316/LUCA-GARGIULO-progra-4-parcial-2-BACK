
/**
 * Estrategia JWT para autenticación con Passport en NestJS.
 * 
 * Implementa la validación de tokens JWT para proteger rutas.
 * 
 * Responsabilidades:
 * 1. Extraer el token del header Authorization (Bearer token)
 * 2. Verificar la firma usando JWT_SECRET
 * 3. Validar fecha de expiración
 * 4. Transformar el payload en un objeto de usuario estandarizado
 * 
 * Uso:
 * - Se aplica automáticamente con el decorador @UseGuards(JwtAuthGuard)
 * - El usuario validado estará disponible en req.user
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            // Extrae el token del encabezado Authorization como Bearer
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

            // Si el token está vencido, se rechaza automáticamente
            ignoreExpiration: false, 

            // Secreto JWT desde archivo .env (via ConfigService)
            secretOrKey: configService.get<string>('JWT_SECRET')!, 
        });
    }

    /**
     * Método que se ejecuta si el token es válido.
     * Transforma el payload del token en un objeto de usuario estandarizado
     * @param payload Contenido decodificado del JWT
     * @returns Objeto de usuario que se adjuntará a req.user
     */
    async validate(payload: any) {
        return {
            sub: payload.sub, // ID del usuario
            username: payload.username, // Nombre de usuario
            perfil: payload.perfil, // Rol (usuario/admin)
        };
    }
}