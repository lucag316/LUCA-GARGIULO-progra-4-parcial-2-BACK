/**
 * Controlador de autenticación de usuarios (`/auth`).
 * Define las rutas públicas para registrar nuevos usuarios y hacer login.
 *
 * Maneja las rutas relacionadas con el registro y autenticación de usuarios:
 * Rutas:
 * - POST `/auth/registro`: recibe los datos del nuevo usuario + imagen de perfil (opcional).
 * - POST `/auth/login`: recibe usuario/correo y contraseña, devuelve el token si es válido.
 *
 * Utiliza:
 *  - FileInterceptor para manejar uploads de imágenes
 * - DTOs para validaciones (`RegistroDto`, `LoginDto`).
 * - Interceptor para subir imagen (Multer).
 * - Pipe personalizado para validar archivos (`FileValidationPipe`).
 * - AuthService para la lógica de negocio
 */

import { Controller, Post, Body, UseInterceptors, UploadedFile } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegistroDto } from "./dto/registro.dto";
import { LoginDto } from "./dto/login.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileValidationPipe } from "src/common/pipes/file-validation.pipe";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { HttpStatus } from "@nestjs/common";
import { HttpCode } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    /**
     * Registra un nuevo usuario
     * Ruta POST /auth/registro
     * @param registroDto Datos del usuario validados con RegistroDto
     * @param file (Opcional) Imagen de perfil validada con FileValidationPipe, Si se envía imagen, se guarda en /uploads y se registra la URL relativa.
     * @returns Usuario creado y token JWT
     */
    @Post('registro')
    @UseInterceptors(FileInterceptor('imagenPerfil', { dest: './uploads' }))
    async register(
        @Body() registroDto: RegistroDto,
        @UploadedFile(new FileValidationPipe()) file?: Express.Multer.File,
    ) {
        const imagenPerfilUrl = file ? `uploads/${file.filename}` : null; // Si se subió archivo, se guarda la ruta relativa para guardarla en BD
        return this.authService.register(registroDto, imagenPerfilUrl);
    }

    /**
     * Autentica a un usuario existente
     * Ruta POST /auth/login
     * Recibe el usuario o email + contraseña.
     * @param loginDto Credenciales validadas con LoginDto
     * @returns token JWT y datos del usuario si las credenciales son válidas
     */
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const { correoOrUsername, password } = loginDto;
        return this.authService.login(correoOrUsername, password);
    }

    @Post('autorizar')
    @HttpCode(HttpStatus.OK)
    async authorize(@Body() body: { token: string }) {
        try {
            const user = await this.authService.validateToken(body.token);
            return { 
            valid: true, 
            user: {
                _id: user._id.toString(), // Convertir ObjectId a string
                email: user.email,
                username: user.username,
                role: user.perfil
            }
            };
        } catch (error) {
            throw new UnauthorizedException('Token inválido o expirado');
        }
    }
}

