/**
     * Controlador de usuarios (`/users`).
     * Define rutas protegidas que permiten:
     * - Obtener los datos del usuario autenticado (`/users/me`).
     * - Obtener sus propias publicaciones (`/users/me/posts`).
     *
     * Características:
     * - Todas las rutas requieren autenticación JWT
     * - Integración con Swagger para documentación API
     * - Inyección de UsersService y PostService
     * - Acceso a datos del usuario desde token (req.user.sub)
     * 
     * Uso de autenticación:
     * - Ambas rutas están protegidas con JWT mediante `JwtAuthGuard`.
     *
     * Swagger:
     * - `@ApiTags` y `@ApiBearerAuth` documentan el uso del token en Swagger.
 */

import { Controller, Get, UseGuards, Request, Post, Put, Body, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAdminGuard } from '../auth/guards/jwt-admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserAdminDto } from '../users/dto/createUserAdmin.dto';

@ApiTags('Users') // Agrupación de endpoints en Swagger
@ApiBearerAuth() // Requiere token JWT en Swagger UI
@Controller('users') 
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

    /**
     * Obtiene el perfil del usuario actual
     * GET /users/me
     * @param req Request con usuario autenticado (JWT payload)
     * @returns Perfil completo del usuario (sin datos sensibles)
     */
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getCurrentUser(@Request() req) {
        return this.usersService.getCurrentUser(req.user.sub);
    }

    /**
     * Obtiene las publicaciones del usuario actual
     * GET /users/me/posts
     * @param req Request con usuario autenticado
     * @returns Listado de publicaciones del usuario actualmente autenticado.
     */
    @Get('me/posts')
    @UseGuards(JwtAuthGuard)
    async getUserPosts(@Request() req) {
        return this.usersService.getUserPosts(req.user.sub);
    }

    // 🆕 RUTA ADMIN: listar todos los usuarios
    @Get()
    @UseGuards(JwtAuthGuard, JwtAdminGuard)
    async listarUsuarios() {
        return this.usersService.listarTodos();
    }

    // 🆕 RUTA ADMIN: crear nuevo usuario
    @Post()
    @UseGuards(JwtAuthGuard, JwtAdminGuard)
    async crearUsuario(@Body() data: CreateUserAdminDto) {
    // Lógica para normalizar, validar, etc
        return this.usersService.crearManual(data);
    }

    // 🆕 RUTA ADMIN: baja lógica (deshabilitar)
    @Delete(':id')
    @UseGuards(JwtAuthGuard, JwtAdminGuard)
    async deshabilitarUsuario(@Param('id') id: string) {
        return this.usersService.bajaLogica(id);
    }

    // 🆕 RUTA ADMIN: alta lógica (rehabilitar)
    @Post('rehabilitar/:id')
    @UseGuards(JwtAuthGuard, JwtAdminGuard)
    async rehabilitarUsuario(@Param('id') id: string) {
        return this.usersService.altaLogica(id);
    }
}