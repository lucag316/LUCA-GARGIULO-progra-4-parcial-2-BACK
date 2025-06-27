// intermediario entre los datos y lo que uso en el controler

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostDto, SortBy } from './dto/get-post.dto';
//import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { forwardRef } from '@nestjs/common';
import { Inject } from '@nestjs/common';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
        //private authService: AuthService,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
    ) {}

    async create(createPostDto: CreatePostDto, userId: string, imagenUrl?: string): Promise<Post> {

        // si s esubio uuna imagen, usamos las ruta  en el lugar del la url de la imagen del dto
        const finalImagenUrl = imagenUrl || createPostDto.imagenUrl;
        const newPost = new this.postModel({ 
            ...createPostDto, 
            autor: userId, 
            imagenUrl: finalImagenUrl,
            likes: []
        }); // si no quiero hacerlo de forma simplificada, lo hacemos con todo y no con ...

        return newPost.save();
    }

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

        // DEBUG opcional
        posts.forEach(p => {
            console.log(`${p.titulo}: ${p.likes?.length || 0} likes`);
        });

        return { posts, total };
    }
    /*async findAll(getPostDto: GetPostDto): Promise<{posts: Post[]; total: number}> {

        const { orden, usuarioId, offset = 0, limit = 10} = getPostDto;
        
        // consilta base - excluir publicaciones eliminadas
        const query = this.postModel.find({ estaEliminado: false });

        // filtrar por usuario si se especifica
        if (usuarioId) {
            if (!Types.ObjectId.isValid(usuarioId)) {
                throw new NotFoundException('El ID de usuario no es valido');
            }
            query.where('autor').equals(usuarioId);
        }

        // ordenar por fecha o cantidad de likes
        if (orden === SortBy.LIKES) {
            //query.sort({ 'likes.length': -1, 'fechaCreacion': -1 });
            query.sort({ 'likes.length': -1, 'fechaCreacion': -1 });
        } else {
            query.sort({ 'fechaCreacion': -1 });
        }

        //aplicacion paginacion
        query.skip(offset).limit(limit);

        // poblar la infomacion del autor
        query.populate('autor', 'username nombre apellido imagenPerfil');


        // ejecutar la consulta
        //const posts = await query.exec();

        const posts = await query.exec();
            posts.forEach(p => {
                console.log(`${p.titulo}: ${p.likes?.length || 0} likes`);
            });

        // contar el total de publicaciones
        const total = await this.postModel.countDocuments({ 
            estaEliminado: false, 
            ...(usuarioId ? { autor: usuarioId } : {})
        });

        console.log('Orden recibido:', orden);
        console.log('Orden aplicado:', orden === SortBy.LIKES ? 'likes' : 'fecha');
        
        return { posts, total };
    }*/

    async findOne(id: string): Promise<Post> {

        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('El ID de post no es valido');
        }

        const post = await this.postModel.findOne({
            _id: id,
            estaEliminado: false
        }).populate('autor', 'username nombre, apellido imagenPerfil').exec();

        if (!post) {
            throw new NotFoundException('Post no encontrado');
        }
        return post;
    }

    async findByUser(userId: string, limit: number = 3): Promise<Post[]> {
    return this.postModel
        .find({ autor: userId, estaEliminado: false })
        .sort({ fechaCreacion: -1 }) // usás este campo en el schema
        .limit(limit)
        .populate('autor', '-password')
        .populate({
        path: 'comentarios.autor',
        select: '-password'
        })
        .exec();
    }

    /*async softDelete(id: string, usuarioId: string) : Promise<Post>{

        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('El ID de post no es valido');
        }

        const post = await this.findOne(id);

        //verificar si el usuario es el autor o un administrador
        const user = await this.usersService.findById(usuarioId); // el profe lo tiene en authsService pero yo en userService porque vi que es mejor separarlo
        const isAdmin = user && user.perfil ? user.perfil.includes('administrador'): false;
        const isAutor = post.autor ? post.autor.toString() === usuarioId : false;

        if (!isAdmin && !isAutor) {
            throw new ForbiddenException('No tienes permiso para eliminar este post');
        }

        const updatePost = await this.postModel.findByIdAndUpdate(
            id,
            {estaEliminado: true},
            {new: true}
        ).exec();

        if (!updatePost) {
            throw new NotFoundException('Pno se pudo cencontra la publiicacion para actualizar');
        }

        return updatePost;
    }*/

    async softDelete(id: string, userId: string): Promise<Post> {
        // 1. Validar que el ID sea válido
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException('ID de publicación no válido');
        }

        // 2. Buscar la publicación
        const post = await this.postModel.findById(id).exec();
        if (!post) {
            throw new NotFoundException('Publicación no encontrada');
        }

        // 3. Verificar permisos (autor o admin)
        const user = await this.usersService.findById(userId);
        const isAdmin = user?.perfil === 'administrador';
        
        // Comparación segura del autor (usando toString() para ObjectId)
        const isAuthor = post.autor.toString() === userId;

        if (!isAdmin && !isAuthor) {
            throw new ForbiddenException('No tienes permiso para eliminar esta publicación');
        }

        // 4. Realizar el soft delete
        const updatedPost = await this.postModel.findByIdAndUpdate(
            id,
            { 
                estaEliminado: true,
                fechaActualizacion: new Date() // Actualizar fecha de modificación
            },
            { new: true } // Devuelve el documento actualizado
        ).exec();

        if (!updatedPost) {
            throw new NotFoundException('No se pudo eliminar la publicación');
        }

        return updatedPost;
    }

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

}
