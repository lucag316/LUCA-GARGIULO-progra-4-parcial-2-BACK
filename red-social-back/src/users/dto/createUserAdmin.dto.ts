

import {
    IsString,
    IsEmail,
    IsNotEmpty,
    MinLength,
    MaxLength,
    Matches,
    IsOptional,
    IsDateString,
    IsIn
} from  'class-validator';

export class CreateUserAdminDto {

    // Nombre del usuario: obligatorio, texto entre 2 y 50 caracteres
    @IsNotEmpty({message: 'El nombre es obligatorio'})
    @IsString({message: 'El nombre debe ser texto'})
    @MinLength(2, {message: 'El nombre debe tener al menos 2 caracteres'})
    @MaxLength(50, {message: 'El nombre debe tener máximo 50 caracteres'})
    nombre: string;

    // Apellido del usuario: obligatorio, texto entre 2 y 50 caracteres
    @IsNotEmpty({message: 'El apellido es obligatorio'})
    @IsString({message: 'El apellido debe ser texto'})
    @MinLength(2, {message: 'El apellido debe tener al menos 2 caracteres'})
    @MaxLength(50, {message: 'El apellido debe tener máximo 50 caracteres'})
    apellido: string;

    // Email: obligatorio, debe tener formato de correo electrónico válido
    @IsNotEmpty({message: 'El email es obligatorio'})
    @IsEmail({},{message: 'El email debe ser válido'})
    email: string;

    // Nombre de usuario: obligatorio, texto entre 3 y 20 caracteres, solo letras, números y guiones bajos
    @IsNotEmpty({message: 'El nombre de usuario es obligatorio'})
    @IsString({message: 'El nombre de usuario debe ser texto'})
    @MinLength(3, {message: 'El nombre de usuario debe tener al menos 3 caracteres'})
    @MaxLength(20, {message: 'El nombre de usuario debe tener máximo 20 caracteres'})
    @Matches(/^[a-zA-Z0-9_]*$/, {message: 'El nombre de usuario solo puede contener letras, números y guiones bajos'})
    username: string;

    // Contraseña: obligatoria, mínimo 8 caracteres, al menos una mayúscula y un número
    @IsNotEmpty({message: 'La contraseña es obligatoria'})
    @MinLength(8, {message: 'La contraseña debe tener al menos 8 caracteres'})
    @Matches(/(?=.*[A-Z])/, { message: 'Debe tener una mayúscula' })
    @Matches(/(?=.*\d)/, { message: 'Debe tener un número' })
    password: string;
    
    // Fecha de nacimiento: obligatoria, debe estar en formato fecha ISO
    @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
    @IsDateString({}, { message: 'Debe tener formato YYYY-MM-DD' })
    fechaNacimiento: string;

    // Descripción del usuario: opcional, debe ser texto
    @IsOptional()
    @IsString({message: 'La descripción debe ser texto'})
    descripcion: string;

    @IsOptional()
    @IsString({ message: 'El perfil debe ser texto' })
    @IsIn(['usuario', 'administrador'], { message: 'El perfil debe ser "usuario" o "administrador"' })
    perfil?: string;
}