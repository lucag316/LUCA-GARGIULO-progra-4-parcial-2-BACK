/**
 * Servicio de usuarios.
 * Encargado de la gestión y obtención de datos del usuario desde la base de datos.
 *
 * Funcionalidades:
 * - Crear un nuevo usuario (`create`).
 * - Buscar por email o username (`findByCorreoOrUsuario`).
 * - Obtener un usuario por ID (`findById`).
 * - Obtener datos del usuario autenticado, sin contraseña (`getCurrentUser`).
 * - Obtener últimas publicaciones del usuario (`getUserPosts`).
 * 
 * Características:
 * - Elimina información sensible (password) en respuestas
 * - Formatea URLs de imágenes de perfil
 * - Integración con el modelo de Posts
 * - Manejo de errores específicos (NotFoundException)
 */

import { Injectable, NotFoundException  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Post } from 'src/posts/schemas/post.schema';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserAdminDto } from './dto/createUserAdmin.dto';



@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Post.name) private postModel: Model<Post> // Modelo de publicaciones
    ) {}

    /**
     * Crea un nuevo usuario en la base de datos.
     * @param data Datos del usuario a crear
     * @returns Usuario creado
     */
    async create(data: Partial<User>) {
        return this.userModel.create(data);
    }

    /**
     * Busca un usuario por email o nombre de usuario.
     * @param value Email o username a buscar
     * @returns Usuario encontrado o null
     */
    async findByCorreoOrUsuario(value: string) {
        return this.userModel.findOne({
            $or: [{ email: value.toLowerCase() }, { username: value }],
        });
    }

    /**
     * Busca un usuario por su ID.
     * @param userId ID del usuario a buscar
     * @returns Usuario encontrado o null
     */
    async findById(userId: string): Promise<User | null> {
        return this.userModel.findById(userId).exec();
    }

    /**
     * Obtiene el perfil completo del usuario actual (sin password)
     * @param userId ID del usuario autenticado
     * @returns Perfil del usuario con URL completa de imagen
     * @throws NotFoundException si el usuario no existe
     */
    async getCurrentUser(userId: string): Promise<User> {
        const user = await this.userModel.findById(userId)
            .select('-password')
            .lean()
            .exec();
        
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        
        // Construye URL completa si existe imagen
        if (user.imagenPerfil) {
            user.imagenPerfil = `http://localhost:3000/uploads/${user.imagenPerfil.replace(/^uploads[\\/]/, '')}`;

        }
        
        return user as User;
    }

    /**
     * Obtiene las últimas publicaciones de un usuario
     * @param userId ID del usuario
     * @param limit Límite de publicaciones a retornar (default: 3)
     * @returns Array de publicaciones con datos del autor
     */
    async getUserPosts(userId: string, limit: number = 3): Promise<any> {
        return this.postModel
            .find({ autor: userId, isActive: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('autor', 'nombre apellido username imagenPerfil')
            .lean()
            .exec();
    }

    /** DESPUES LA PUEDO HACER FUNCIONAR
     * Devuelve la base URL de la API para construir rutas públicas.
     * Se usa en `imagenPerfil`, si querés parametrizar el host más adelante.
     */
    private getBaseUrl(): string {
        return process.env.BASE_URL || 'http://localhost:3000';
    }

     /** 🟢 Lista todos los usuarios (solo admin) */
    async listarTodos(): Promise<Omit<User, 'password'>[]> {
        return this.userModel.find().select('-password');
    }


/** 🟢 Crea un nuevo usuario manual (desde admin) */
    async crearManual(data: CreateUserAdminDto): Promise<User> {
    if (!data.password) {
        throw new Error('La contraseña es obligatoria para crear el usuario');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const nuevo = new this.userModel({
        ...data,
        fechaNacimiento: new Date(data.fechaNacimiento), // <-- conversión aquí
        password: hashedPassword,
        isActive: true,
        perfil: data.perfil ?? 'usuario', // por defecto será usuario si no se especifica
    });

    return nuevo.save();
    }

 /** 🟡 Desactiva (baja lógica) */
  async bajaLogica(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    user.isActive = false;
    return user.save();
  }
/** 🟢 Activa (alta lógica) */
  async altaLogica(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    user.isActive = true;
    return user.save();
  }
}