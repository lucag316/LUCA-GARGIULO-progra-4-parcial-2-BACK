import { IsString, IsNotEmpty } from "class-validator";


export class LoginDto {
    @IsNotEmpty({ message: 'Debes ingresar un usuario o email' })
    @IsString({ message: 'El usuario o email debe ser texto' })
    correoOrUsername: string;

    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @IsString({ message: 'La contraseña debe ser texto' })
    password: string;
}