// intermediario entre los datos y lo que uso en el controler

import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostDto, SortBy } from './dto/get-post.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
        private authService: AuthService
    ) {}

    async create(createPostDto: CreatePostDto, userId: string, imagenUrl?: string): Promise<Post> {

        // si s esubio uuna imagen, usamos las ruta  en el lugar del la url de la imagen del dto
        const finalImagenUrl = imagenUrl || createPostDto.imagenUrl;
        const newPost = new this.postModel({ 
            ...createPostDto, 
            user: userId, 
            imagenUrl: finalImagenUrl,
            likes: []
        }); // si no quiero hacerlo de forma simplificada, lo hacemos con todo y no con ...

        return newPost.save();
    }

    async findAll(getPostDto: GetPostDto): Promise<{posts: Post[]; total: number}> {

        const { sortBy, usuarioId, offset = 0, limit = 10} = getPostDto;
        
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
        if ( sortBy === SortBy.LIKES) {
            query.sort({ 'likes.length': -1 , 'fechaCreacion': -1 });
        } else {
            query.sort({ 'fechaCreacion': -1 });
        }

        //aplicacion paginacion
        query.skip(offset).limit(limit);

        // poblar la infomacion del autor
        query.populate('autor', 'username nombre, apellido imagenPerfil');


        // ejecutar la consulta
        const posts = await query.exec();

        // contar el total de publicaciones
        const total = await this.postModel.countDocuments({ 
            estaEliminado: false, 
            ...(usuarioId ? { autor: usuarioId } : {})
        });


        return { posts, total };
    }
}

