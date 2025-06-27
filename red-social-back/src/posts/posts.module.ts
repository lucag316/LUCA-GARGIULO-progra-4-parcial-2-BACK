
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostController } from './posts.controller';
import { PostService } from './post.service';
import { Post, PostSchema } from './schemas/post.schema';
//import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { forwardRef } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        // Importa el schema de Mongoose: define cómo se guardan las publicaciones en MongoDB
        MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
        // Importa el módulo de usuarios para usar su servicio (necesario en softDelete, por ejemplo)
        //UsersModule,
        forwardRef(() => UsersModule),
        // Importa el módulo de autenticación (si usás validación extra de JWT u otros helpers)
        //AuthModule
        forwardRef(() => AuthModule),
    ],
    controllers: [PostController],
    providers: [PostService],
    exports: [PostService]
})

export class PostsModule {}