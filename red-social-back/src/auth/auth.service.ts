
/**
 * Servicio de autenticación de usuarios.
 * Se encarga de registrar, autenticar y obtener datos del usuario.
 * Funciones:
 * - `register`: crea un nuevo usuario, encripta la contraseña, manejo de imagen de perfil y genera un JWT.
 * - `login`: verifica credenciales, genera y devuelve un token.
 * - `getPerfilUsuario`: obtiene datos del perfil, excluyendo la contraseña.
 * - `getPublicacionesUsuario`: devuelve las últimas publicaciones de un usuario con comentarios.
 * 
 * Características clave:
 * - Validación de usuarios únicos (email/username)
 * - Encriptación BCrypt para contraseñas
 * - Generación de tokens JWT
 * - Manejo de errores específicos (Conflict, Unauthorized)
 * - Transformación segura de datos (elimina password en respuestas)
 */

import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { RegistroDto } from './dto/registro.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService
    ) {}

    /**
     * Registra un nuevo usuario en la base de datos:
     * - Verifica si el username o email ya están en uso.
     * - Encripta la contraseña.
     * - Guarda los datos del usuario con la imagen de perfil si existe.
     * @param registroDto Datos validados del usuario
     * @param imagenPerfilUrl (Opcional) Ruta de la imagen de perfil
     * @returns {Object} Usuario creado + token JWT (sin password)
     */
    async register(registroDto: RegistroDto, imagenPerfilUrl?:string | null): Promise<any> {
        try{
            const { email, username, password } = registroDto;

            // verificar si ya existe el usuario con el mismo username o email
            const existeUser = await this.userModel.findOne({
                $or: [
                    { username: username.toLowerCase() }, 
                    { email: email.toLowerCase() }
                ] 
            });

            if (existeUser) {
                if (existeUser.username === username.toLowerCase()) {
                    throw new ConflictException('El nombre de usuario ya está en uso');
                }

                if (existeUser.email === email.toLowerCase()) {
                    throw new ConflictException('El email ya está en uso');
                }
            }


            // encriptar la contraseña con salt de 12 rounds
            const saltRounds = 12; // para la complejidad
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // crear el nuevo usuario
            const newUser = new this.userModel({
                nombre: registroDto.nombre,
                apellido: registroDto.apellido,
                email: email.toLowerCase(),
                username: username.toLowerCase(),
                password: hashedPassword,
                fechaNacimiento: registroDto.fechaNacimiento,
                descripcion: registroDto.descripcion,
                imagenPerfil: imagenPerfilUrl ?? null,
                perfil: 'usuario',
                isActive: true,
            });

            // guardar el nuevo usuario en la base de datos
            const savedUser = await newUser.save();

            // Generar token
            const payload = {
                sub: savedUser._id,
                email: savedUser.email,
                username: savedUser.username,
                perfil: savedUser.perfil,
            };

            const token = this.generarToken(payload);

            // convertir objetos y eliminar la costraseña de la respuesta
            const userObject = savedUser.toObject();
            const {password:_, ... userWithoutPassword} = userObject;

            return{
                success: true,
                message: 'Usuario registrado correctamente',
                data: {
                    user: userWithoutPassword,
                    userId: (savedUser._id as Types.ObjectId).toString(),
                    token
                },
            };
        }catch(error){

            // Validación de esquema Mongoose
            if(error.name === 'ValidationError') {
                const validationError = Object.values(error.errors).map(
                    (err:any) => err.message
                );
                throw new BadRequestException({
                    success: false,
                    message: 'Error al registrar el usuario',
                    errors: validationError 
                });
            }

            // Error por campo duplicado
            if (error.code === 11000) {
                const campo = Object.keys(error.keyPattern)[0];
                const mensaje =
                    campo === 'username'
                        ? 'El nombre de usuario ya está en uso'
                        : 'El email ya está en uso';
                throw new ConflictException(mensaje);
            }

            // Otros errores inesperados
            throw new BadRequestException('Error interno al registrar usuario');
        }
    }

    /**
     * Inicia sesión:
     * - Verifica si el usuario o email existen.
     * - Compara la contraseña ingresada con la hash.
     * @param correoOrUsername Email o nombre de usuario
     * @param password Contraseña sin encriptar
     * @returns {Object} Datos del usuario + token JWT
     */
    async login(correoOrUsername: string, password: string) {
        const user = await this.userModel.findOne({
            $or: [
                { email: correoOrUsername.toLowerCase() },
                { username: correoOrUsername },
            ],
        }).lean().exec();

        if (!user) throw new UnauthorizedException('Usuario o email incorrecto');

        const passwordValida = await bcrypt.compare(password, user.password);
        if (!passwordValida) throw new UnauthorizedException('Contraseña incorrecta');

        // Manejo de imagen (undefined o string)
        const imagenPerfilCompleta = user.imagenPerfil 
            ? `http://localhost:3000/${user.imagenPerfil.replace(/^uploads[\\/]/, '')}`
            : undefined;

        const payload = {
            sub: user._id,
            email: user.email,
            username: user.username,
            perfil: user.perfil,
            imagenPerfil: imagenPerfilCompleta,
            nombre: user.nombre,
            apellido: user.apellido
        };

        const token = this.generarToken(payload);

        return {
            success: true,
            message: 'Login exitoso',
            data: {
                user: {
                    ...user,
                    _id: user._id.toString(),
                    imagenPerfil: imagenPerfilCompleta
                },
                token,
            },
        };
    }
    // Añade este método a tu AuthService
    async refreshToken(token: string): Promise<{ newToken: string }> {
        try {
            // 1. Verificar token existente (incluye chequeo de expiración)
            const payload = this.jwtService.verify(token);
            
            // 2. Verificar usuario aún existe
            const user = await this.userModel.findById(payload.sub);
            if (!user) {
                throw new UnauthorizedException('Usuario no encontrado');
            }

            // 3. Crear nuevo payload (misma data)
            const newPayload = {
                sub: payload.sub,       // ID usuario
                email: payload.email,   // Mismo email
                username: payload.username, // Mismo username
                perfil: payload.perfil,  // Mismo rol
                imagenPerfil: payload.imagenPerfil,
                nombre: payload.nombre,
                apellido: payload.apellido
            };

            // 4. Generar nuevo token (15 mins)
            const newToken = this.generarToken(payload);

            return { newToken };
            
        } catch (error) {
            // Captura errores de verificación (token inválido/vencido)
            throw new UnauthorizedException('Token no puede ser refrescado');
        }
    }

    /**
     * Obtiene perfil de usuario sin información sensible
     * @param userId ID del usuario
     * @returns Perfil sin campo password
     */
    async getPerfilUsuario(userId: string) {
    return this.userModel.findById(userId).select('-password');
    }

    /**
     * Obtiene las últimas publicaciones de un usuario
     * @param userId ID del usuario
     * @param limit Límite de publicaciones (default: 3)
     * @returns Publicaciones con sus comentarios
     */
    async getPublicacionesUsuario(userId: string, limit: number = 3) {
        return this.userModel.aggregate([
            { $match: { _id: new Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'publicaciones', 
                    localField: '_id',
                    foreignField: 'autor._id',
                    as: 'publicaciones',
                    pipeline: [
                        { $match: { estaEliminado: false } },
                        { $sort: { fechaCreacion: -1 } },
                        { $limit: limit },
                        {
                            $lookup: {
                            from: 'comentarios',
                            localField: '_id',
                            foreignField: 'publicacionId',
                            as: 'comentarios',
                            },
                        },
                    ],
                },
            },
            { $project: { publicaciones: 1 } },
        ]);
    }

    async validateToken(token: string): Promise<UserDocument> { // Usar UserDocument en lugar de User
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.userModel.findById(payload.sub).exec();
            
            if (!user) {
            throw new Error('Usuario no encontrado');
            }
            
            return user;
        } catch (error) {
            throw new UnauthorizedException('Token inválido o expirado');
        }
    }

    generarToken(payload: any): string {
        return this.jwtService.sign(payload, { expiresIn: '15m' });
    }
}