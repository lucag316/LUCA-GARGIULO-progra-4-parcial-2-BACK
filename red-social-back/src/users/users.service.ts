
import { Injectable, NotFoundException  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Post } from 'src/posts/schemas/post.schema';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Post.name) private postModel: Model<Post> // Inyectamos el modelo de Post
    ) {}

    async create(data: Partial<User>) {
        return this.userModel.create(data);
    }

    async findByCorreoOrUsuario(value: string) {
        return this.userModel.findOne({
            $or: [{ email: value.toLowerCase() }, { username: value }],
        });
    }

    async findById(userId: string): Promise<User | null> {
        return this.userModel.findById(userId).exec();
    }

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
            user.imagenPerfil = `http://localhost:3000/${user.imagenPerfil.replace(/^uploads[\\/]/, '')}`;
        }
        
        return user as User;
    }

    private getBaseUrl(): string {
        return process.env.BASE_URL || 'http://localhost:3000';
    }

    async getUserPosts(userId: string, limit: number = 3): Promise<any> {
        return this.postModel
            .find({ autor: userId, isActive: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('autor', 'nombre apellido username imagenPerfil')
            .lean()
            .exec();
    }
}