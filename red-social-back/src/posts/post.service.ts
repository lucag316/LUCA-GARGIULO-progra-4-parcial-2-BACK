/**
 * Servicio de publicaciones (`PostService`).
 * Encargado de la lógica entre el controlador y la base de datos (MongoDB).
 *
 * Funcionalidades:
 * - Crear una publicación con o sin imagen.
 * - Listar publicaciones activas, con orden, filtros y paginación.
 * - Obtener publicaciones por ID o por usuario.
 * - Baja lógica (soft delete), con validación de permisos.
 * - Likes: agregar y quitar "me gusta" con control de duplicados.
 */

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostDto, SortBy } from './dto/get-post.dto';
import { UsersService } from 'src/users/users.service';
import { forwardRef, Inject } from '@nestjs/common';


@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
        
        // Inyecta UsersService usando forwardRef para evitar dependencia circular
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
    ) {}

    /**
     * Crea una nueva publicación.
     * Si se subió una imagen, se usa la ruta guardada; si no, se toma la URL del DTO.
     */
    async create(createPostDto: CreatePostDto, userId: string, imagenUrl?: string): Promise<Post> {

        const finalImagenUrl = imagenUrl || createPostDto.imagenUrl;

        const newPost = new this.postModel({ 
            ...createPostDto, 
            autor: userId, 
            imagenUrl: finalImagenUrl,
            likes: []
        }); // si no quiero hacerlo de forma simplificada, lo hacemos con todo y no con ...

        return newPost.save();
    }

    /**
     * Obtiene publicaciones activas con:
     * - Filtro por usuario (opcional)
     * - Ordenamiento por fecha o cantidad de likes
     * - Paginación con offset y limit
     */
    async findAll(getPostDto: GetPostDto): Promise<{ posts: Post[]; total: number }> {
        const { orden, usuarioId, offset = 0, limit = 10 } = getPostDto;

        const match: any = { estaEliminado: false };

        if (usuarioId) {
            if (!Types.ObjectId.isValid(usuarioId)) {
                throw new NotFoundException('El ID de usuario no es válido');
            }
            match.autor = new Types.ObjectId(usuarioId);
        }

        const pipeline: any[] = [
            { $match: match },
            {
                $addFields: {
                    likesCount: { $size: { $ifNull: ['$likes', []] } }
                }
            },
            {
                $sort: orden === SortBy.LIKES
                    ? { likesCount: -1, createdAt: -1 }
                    : { createdAt: -1 }
            },
            { $skip: offset },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: 'autor',
                    foreignField: '_id',
                    as: 'autor'
                }
            },
            { $unwind: '$autor' },
            {
                $project: {
                    titulo: 1,
                    descripcion: 1,
                    imagenUrl: 1,
                    autor: {
                        _id: '$autor._id',
                        username: '$autor.username',
                        nombre: '$autor.nombre',
                        apellido: '$autor.apellido',
                        imagenPerfil: '$autor.imagenPerfil',
                    },
                    likes: 1,
                    estaEliminado: 1,
                    fechaCreacion: 1,
                    fechaActualizacion: 1,
                }
            }
        ];

        const posts = await this.postModel.aggregate(pipeline).exec();
        const total = await this.postModel.countDocuments(match);

        return { posts, total };
    }

    /**
     * Devuelve una publicación por su ID, validando que no esté eliminada.
     */
    async findOne(id: string): Promise<Post> {

        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('El ID de post no es valido');
        }

        const post = await this.postModel.findOne({
            _id: id,
            estaEliminado: false
        }).populate('autor', 'username nombre apellido imagenPerfil').exec();

        if (!post) {
            throw new NotFoundException('Publicación no encontrada');
        }
        return post;
    }

    /**
     * Devuelve las últimas publicaciones activas de un usuario específico.
     * Incluye población del autor y de los comentarios.
     */
    async findByUser(userId: string, limit: number = 3): Promise<Post[]> {
    return this.postModel
        .find({ autor: userId, estaEliminado: false })
        .sort({ fechaCreacion: -1 }) // FIJARME DESPUES DE USAR EL CREATED AT
        .limit(limit)
        .populate('autor', '-password')
        .populate({
        path: 'comentarios.autor',
        select: '-password'
        })
        .exec();
    }

    /**
     * Marca una publicación como eliminada (soft delete).
     * Solo el autor o un administrador pueden hacerlo.
     */
    async softDelete(id: string, userId: string): Promise<Post> {

        // Validar que el ID sea válido
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('ID de publicación no válido');
        }

        // Buscar la publicación
        const post = await this.postModel.findById(id).exec();
        if (!post) {
            throw new NotFoundException('Publicación no encontrada');
        }

        // Verificar permisos (autor o admin)
        const user = await this.usersService.findById(userId);
        const isAdmin = user?.perfil === 'administrador';
        
        // Comparación segura del autor (usando toString() para ObjectId)
        const isAuthor = post.autor.toString() === userId;

        if (!isAdmin && !isAuthor) {
            throw new ForbiddenException('No tienes permiso para eliminar esta publicación');
        }

        // Realizar el soft delete
        const updatedPost = await this.postModel.findByIdAndUpdate(
            id,
            { 
                estaEliminado: true,
                fechaActualizacion: new Date() // Actualizar fecha de modificación VER SI USAR EL OTRO
            },
            { new: true } // Devuelve el documento actualizado
        ).exec();

        if (!updatedPost) {
            throw new NotFoundException('No se pudo eliminar la publicación');
        }

        return updatedPost;
    }

    /**
     * Agrega un "me gusta" a una publicación.
     * Verifica que el usuario no haya dado like previamente.
     */
    async addLike(postId: string, usuarioId: string) : Promise<Post>{

        if (!Types.ObjectId.isValid(postId)) {
            throw new NotFoundException('El ID de post no es valido');
        }

        const post = await this.findOne(postId);

        //verificar si el usuario ya dio like a la publicacion
        if (post.likes && post.likes.some(like => like?.toString() === usuarioId)) {
            throw new ForbiddenException('Ya has dado like a esta publicacion');
        }

        const updatePost = await this.postModel.findByIdAndUpdate(
            postId,
            {$push: {likes: usuarioId}},
            {new: true}
        ).exec();

        if (!updatePost) {
            throw new NotFoundException('Pno se pudo cencontra la publiicacion para actualizar');
        }

        return updatePost;
    }

    /**
     * Quita un "me gusta" de una publicación.
     * Verifica que el usuario lo haya dado previamente.
     */
    async removeLike(postId: string, usuarioId: string) : Promise<Post>{

        if (!Types.ObjectId.isValid(postId)) {
            throw new NotFoundException('El ID de post no es valido');
        }

        const post = await this.findOne(postId);

        //verificar si el usuario ya dio like a la publicacion
        if (!post.likes || !post.likes.some(like => like?.toString() === usuarioId)) {
            throw new ForbiddenException('No has dado like a esta publicacion');
        }

        const updatePost = await this.postModel.findByIdAndUpdate(
            postId,
            {$pull: {likes: usuarioId}},
            {new: true}
        ).exec();

        if (!updatePost) {
            throw new NotFoundException('Pno se pudo cencontra la publiicacion para actualizar');
        }

        return updatePost;
    }


    async addComment(postId: string, userId: string, contenido: string): Promise<Post> {
        if (!Types.ObjectId.isValid(postId)) {
            throw new NotFoundException('ID de publicación inválido');
        }

        const comentario = {
            contenido,
            autor: new Types.ObjectId(userId),
            fechaCreacion: new Date(),
            modificado: false
        };

        const updatedPost = await this.postModel.findByIdAndUpdate(
            postId,
            { $push: { comentarios: comentario } },
            { new: true }
        )
        .populate('comentarios.autor', 'username imagenPerfil') // opcional
        .exec();

        if (!updatedPost) {
            throw new NotFoundException('Publicación no encontrada');
        }

        return updatedPost;
    }

    async updateComment(postId: string, comentarioId: string, userId: string, nuevoContenido: string): Promise<Post> {
        if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(comentarioId)) {
            throw new NotFoundException('ID inválido');
        }

        const post = await this.postModel.findById(postId).exec();
        if (!post) {
            throw new NotFoundException('Publicación no encontrada');
        }

        const comentario = post.comentarios.find(c => c._id?.toString() === comentarioId);
        if (!comentario) {
            throw new NotFoundException('Comentario no encontrado');
        }

        // Verificar que el autor del comentario sea el mismo que quien lo intenta editar
        if (comentario.autor.toString() !== userId) {
            throw new ForbiddenException('No tienes permiso para editar este comentario');
        }

        comentario.contenido = nuevoContenido;
        comentario.modificado = true;

        const updatedPost = await post.save();
        return updatedPost;
    }

    async getComentarios(postId: string, offset = 0, limit = 5) {
        if (!Types.ObjectId.isValid(postId)) {
            throw new NotFoundException('ID de publicación inválido');
        }

        const post = await this.postModel.findById(postId)
            .populate('comentarios.autor', 'username imagenPerfil')
            .lean(); //  para realizar consultas a bases de datos de una manera más eficiente

        if (!post) {
            throw new NotFoundException('Publicación no encontrada');
        }

        // Ordenar por fecha descendente y aplicar paginación manual
        const comentariosOrdenados = (post.comentarios || [])
            .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
            .slice(offset, offset + limit);

        return {
            total: post.comentarios?.length || 0,
            comentarios: comentariosOrdenados
        };
    }
    
}
