/**
 * Módulo de autenticación (`AuthModule`) para la red social.
 *
 * Funcionalidad:
 * - Configura el JWT para login y protección de rutas.
 * - Define los proveedores necesarios para login, registro y validación de tokens.
 * - Registra el esquema `User` para trabajar con MongoDB.
 * - Usa configuración asíncrona para cargar el secreto del token desde variables de entorno.
 *
 * Exporta:
 * - `AuthService` para uso en otros módulos.
 * - `JwtAuthGuard` para proteger rutas en controladores externos.
 * - `JwtModule` para que otros módulos puedan firmar/verificar tokens.
 */

import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        // Vincula el esquema de User al módulo de autenticación
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        
        // Passport se configura con JWT como estrategia por defecto
        PassportModule.register({ defaultStrategy: 'jwt' }),

        // Importa UsersModule con forwardRef (por dependencia circular)
        forwardRef(() => UsersModule),

        // Configura el módulo de JWT de forma asíncrona usando variables de entorno
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'), // Secreto desde .env
                signOptions: { expiresIn: '15m' }, // Duración del token 
            }),
        }),
    ],
    providers: [
        AuthService, // Lógica de login y registro
        JwtStrategy, // Estrategia JWT usada por Passport
        JwtAuthGuard, // Guard para proteger rutas con token
    ],
    controllers: [AuthController],
    exports: [
        AuthService,
        JwtAuthGuard, 
        JwtModule, // Permite que otros módulos firmen/verifiquen JWT
    ],
})
export class AuthModule {}
