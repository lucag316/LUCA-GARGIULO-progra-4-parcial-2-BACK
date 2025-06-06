
import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserSchema } from 'src/users/schemas/user.schema';
import { RegistroDto } from './dto/registro.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService
    ) {}

    async register(registroDto: RegistroDto, imagenPerfilUrl?:string | null): Promise<any> {
        try{
            const { email, username, password } = registroDto;

            // verificar si ya existe el usuario con el mismo username o email
            const existeUser = await this.userModel.findOne({
                $or: [
                    { username: username.toLowerCase() }, 
                    { email: email.toLowerCase() }
                ] 
            });

            if (existeUser) {
                if (existeUser.username === username.toLowerCase()) {
                    throw new ConflictException('El nombre de usuario ya está en uso');
                }

                if (existeUser.email === email.toLowerCase()) {
                    throw new ConflictException('El email ya está en uso');
                }
            }


            // encriptar la contraseña con salt de 12 rounds
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // crear el nuevo usuario
            const newUser = new this.userModel({
                nombre: registroDto.nombre,
                apellido: registroDto.apellido,
                email: email.toLowerCase(),
                username: username.toLowerCase(),
                password: hashedPassword,
                fechaNacimiento: registroDto.fechaNacimiento,
                descripcion: registroDto.descripcion,
                imagenPerfil: imagenPerfilUrl ?? null,
                perfil: 'usuario',
                isActive: true,
            });

            // guardar el nuevo usuario en la base de datos
            const savedUser = await newUser.save();

            // convertir objetis y eliminar la costraseña de la respuesta
            const userObject = savedUser.toObject();
            const {password:_, ... userWithoutPassword} = userObject;

            return{
                success: true,
                message: 'Usuario registrado correctamente',
                data: {
                    user: userWithoutPassword,
                    userId: (savedUser._id as Types.ObjectId).toString()
                },
            };
        }catch(error){
            // error de validacion de mongoose
            if(error.name === 'ValidationError') {
                const validationError = Object.values(error.errors).map(
                    (err:any) => err.message
                );
                throw new BadRequestException({
                    success: false,
                    message: 'Error al registrar el usuario',
                    errors: validationError 
                });
            }


            // Error por campo duplicado
            if (error.code === 11000) {
                const campo = Object.keys(error.keyPattern)[0];
                const mensaje =
                    campo === 'username'
                        ? 'El nombre de usuario ya está en uso'
                        : 'El email ya está en uso';
                throw new ConflictException(mensaje);
            }

            // Otros errores inesperados
            throw new BadRequestException('Error interno al registrar usuario');

        }
    }

    async login(correoOrUsername: string, password: string) {
        const user = await this.userModel.findOne({
            $or: [
            { email: correoOrUsername.toLowerCase() },
            { username: correoOrUsername },
            ],
        });

        if (!user) {
            throw new UnauthorizedException('Usuario o email incorrecto');
        }

        const passwordValida = await bcrypt.compare(password, user.password);

        if (!passwordValida) {
            throw new UnauthorizedException('Contraseña incorrecta');
        }

        const payload = {
            sub: user._id,
            email: user.email,
            username: user.username,
            perfil: user.perfil,
        };

        const token = this.jwtService.sign(payload);

        const { password: _, ...userSinPassword } = user.toObject();

        return {
            success: true,
            message: 'Login exitoso',
            data: {
                user: userSinPassword,
                token,
            },
        };
    }
}