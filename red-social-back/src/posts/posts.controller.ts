import { Controller, Post, Body, Get, Delete, Param, Query, Req, UseGuards, UseInterceptors, UploadedFile } from "@nestjs/common";
import { PostService } from "./post.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { GetPostDto } from "./dto/get-post.dto";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileValidationPipe } from "src/common/pipes/file-validation.pipe";
import { Request } from "express";

@Controller('posts')
@UseGuards(AuthGuard('jwt'))
export class PostController {
    constructor(private readonly postService: PostService) {}

    // crear publicacion
    @Post()
    @UseInterceptors(FileInterceptor('imagenPost', { dest: './uploads' }))
    async create(
        @Body() createPostDto: CreatePostDto, 
        @Req() req: Request,
        @UploadedFile(new FileValidationPipe()) file?: Express.Multer.File, 
    ) {
        const imagenUrl = file ? `uploads/${file.filename}` : undefined;
        const user = req.user as { sub: string };
        const userId = user.sub;
        return this.postService.create(createPostDto, userId, imagenUrl);
    }

    // Listar publicaciones con filtros
    @Get()
    async findAll(@Query() getPostDto: GetPostDto) {
        return this.postService.findAll(getPostDto);
    }

    // Baja lógica
    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: Request) {
        const user = req.user as { sub: string };
        const userId = user.sub;
        return this.postService.softDelete(id, userId);
    }

    // Dar me gusta
    @Post(':id/me-gusta')
    async like(@Param('id') postId: string, @Req() req: Request) {
        const user = req.user as { sub: string };
        const userId = user.sub;
        return this.postService.addLike(postId, userId);
    }

    // Quitar me gusta
    @Delete(':id/me-gusta')
    async unlike(@Param('id') postId: string, @Req() req: Request) {
        const user = req.user as { sub: string };
        const userId = user.sub;
        return this.postService.removeLike(postId, userId);
    }
}