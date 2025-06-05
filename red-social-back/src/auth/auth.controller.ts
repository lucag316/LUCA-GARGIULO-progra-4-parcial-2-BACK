
import { Controller, Post, Body, UseInterceptors, UploadedFile } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegistroDto } from "./dto/registro.dto";
import { LoginDto } from "./dto/login.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileValidationPipe } from "src/common/pipes/file-validation.pipe";


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }


    // Ruta para registrar usuario
    @Post('register')
    @UseInterceptors(FileInterceptor('imagenPerfil', { dest: './uploads' }))
    async register(
        @Body() registroDto: RegistroDto,
        @UploadedFile(new FileValidationPipe()) file?: Express.Multer.File,
    ) {
        // Si se subió archivo, se guarda la ruta relativa para guardarla en BD
        const imagenPerfilUrl = file ? `uploads/${file.filename}` : null;

        return this.authService.register(registroDto, imagenPerfilUrl);
    }

    // Ruta para login (usuario o correo + password)
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const { correoOrUsername, password } = loginDto;
        return this.authService.login(correoOrUsername, password);
    }
}

