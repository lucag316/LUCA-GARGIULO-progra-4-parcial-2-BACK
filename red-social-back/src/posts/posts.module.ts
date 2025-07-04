/**
 * Módulo de publicaciones (`PostsModule`).
 * 
 * Este módulo gestiona todo lo relacionado a las publicaciones:
 * - Define el esquema Mongoose `Post`.
 * - Registra el controlador y el servicio correspondiente.
 * - Importa los módulos de usuarios y autenticación para resolver dependencias.
 * 
 * Se usa `forwardRef` para romper la dependencia circular entre `PostsModule` y `UsersModule`.
 */


import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostController } from './posts.controller';
import { PostService } from './post.service';
import { Post, PostSchema } from './schemas/post.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { EstadisticasController } from './estadisticas/estadisticas.controller';
import { EstadisticasService } from './estadisticas/estadisticas.service';

@Module({
    imports: [
        // Importa el schema de Mongoose: define cómo se guardan las publicaciones en MongoDB
        MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
        
        // Importa UsersModule usando forwardRef (por dependencia circular en servicios)
        forwardRef(() => UsersModule),
        
        // Importa AuthModule usando forwardRef (por uso en validaciones o JWT helpers)
        forwardRef(() => AuthModule),
    ],
    controllers: [PostController, EstadisticasController], // Define las rutas disponibles
    providers: [PostService, EstadisticasService], // Servicio que contiene la lógica de publicaciones
    exports: [PostService, EstadisticasService]  // Exporta el servicio para uso externo (por ejemplo, desde UsersModule)
})

export class PostsModule {}