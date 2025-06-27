/**
     * Módulo de usuarios (`UsersModule`) de la red social.
     * 
     * Este módulo agrupa la lógica y recursos relacionados a los usuarios:
     * - Registra el schema de `User` y `Post` en Mongoose (para consultas y relaciones).
     * - Declara el `UsersService` y su controlador.
     * - Usa `forwardRef` para importar `PostsModule`, rompiendo dependencia circular.
     * 
     * Exporta el servicio `UsersService` para ser usado en otros módulos (ej. Auth).
 */

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Post, PostSchema } from '../posts/schemas/post.schema';
import { PostsModule } from 'src/posts/posts.module';

@Module({
    imports: [
        // Registra los esquemas de usuario y publicación para Mongoose
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Post.name, schema: PostSchema }
        
        ]),
        // Importa el módulo de publicaciones usando forwardRef (por circularidad)
        forwardRef(() => PostsModule), 
        
    ],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService], // Permite que otros módulos lo inyecten (ej. Auth)
})
export class UsersModule {}