import { Controller, Post, Body, Get, Delete, Param, Query, Req, UseGuards, UseInterceptors, UploadedFile } from "@nestjs/common";
import { PostService } from "./post.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { GetPostDto } from "./dto/get-post.dto";
import { AuthGuard } from "@nestjs/passport"; // Protección con JWT
import { FileInterceptor } from "@nestjs/platform-express";
import { FileValidationPipe } from "src/common/pipes/file-validation.pipe";
import { Request } from "express"; // Para acceder a req.user desde JWT

@Controller('posts')
@UseGuards(AuthGuard('jwt')) // Protege todas las rutas del controlador con JWT
export class PostController {
    constructor(private readonly postService: PostService) {}

    
    /**
    * POST /posts
    * Crea una nueva publicación con los datos enviados y la imagen opcional.
    * Solo puede hacerlo un usuario autenticado.
    */
    @Post()
    @UseInterceptors(FileInterceptor('imagenPost', { dest: './uploads' })) // Interceptor para manejar la subida de imagen
    async create(
        @Body() createPostDto: CreatePostDto,  // Datos de la publicación (título, descripción)
        @Req() req: Request, // Accede al usuario autenticado (req.user.sub)
        @UploadedFile(new FileValidationPipe()) file?: Express.Multer.File,  // Imagen opcional + validación de formato/tamaño
    ) {
        const imagenUrl = file ? `uploads/${file.filename}` : undefined; // Ruta relativa de la imagen guardada
        const user = req.user as { sub: string }; // Extrae el ID del usuario desde el token
        const userId = user.sub;
        return this.postService.create(createPostDto, userId, imagenUrl); // Crea la publicación en el servicio
    }

    /**
    * GET /posts
    * Lista las publicaciones activas, con filtros opcionales:
    * - Ordenamiento por fecha o cantidad de likes
    * - Filtrado por usuario
    * - Paginación con offset y limit
    */
    @Get()
    async findAll(@Query() getPostDto: GetPostDto) {
        return this.postService.findAll(getPostDto);  // Llama al servicio para filtrar, ordenar y paginar
    }

    /**
    * DELETE /posts/:id
    * Baja lógica de una publicación (marca como eliminada, no la borra).
    * Solo puede hacerlo el autor o un administrador.
    */
    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: Request) {
        const user = req.user as { sub: string }; // ID del usuario autenticado
        const userId = user.sub;
        return this.postService.softDelete(id, userId);  // Valida permisos y marca la publicación como eliminada
    }

    /**
    * POST /posts/:id/me-gusta
    * Da "me gusta" a una publicación. Solo un like por usuario.
    */
    @Post(':id/me-gusta')
    async like(@Param('id') postId: string, @Req() req: Request) {
        const user = req.user as { sub: string };
        const userId = user.sub;
        return this.postService.addLike(postId, userId); // Agrega el userId al array de likes
    }

    /**
    * DELETE /posts/:id/me-gusta
    * Quita el "me gusta" de una publicación, si el usuario ya la había likeado.
    */
    @Delete(':id/me-gusta')
    async unlike(@Param('id') postId: string, @Req() req: Request) {
        const user = req.user as { sub: string };
        const userId = user.sub;
        return this.postService.removeLike(postId, userId); // Elimina el userId del array de likes
    }
}