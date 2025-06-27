/**
 * DTO para el login de usuarios.
 * Recibe un campo único (puede ser email o username) y una contraseña,
 * y valida que ambos sean textos no vacíos antes de procesar el login.
 */

import { IsString, IsNotEmpty } from "class-validator";


export class LoginDto {

    // Campo que puede ser correo electrónico o nombre de usuario
    @IsNotEmpty({ message: 'Debes ingresar un usuario o email' })
    @IsString({ message: 'El usuario o email debe ser texto' })
    correoOrUsername: string;

    // Contraseña obligatoria, debe ser un texto no vacío
    // (La validación de complejidad se hace en el servicio).
    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @IsString({ message: 'La contraseña debe ser texto' })
    password: string;
}