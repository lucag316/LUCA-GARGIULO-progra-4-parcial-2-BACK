import {
    IsString,
    IsEmail,
    IsNotEmpty,
    MinLength,
    MaxLength,
    Matches,
    IsOptional,
    IsDateString
} from  'class-validator';

export class RegistroDto {

    @IsNotEmpty({message: 'El nombre es obligatorio'})
    @IsString({message: 'El nombre debe ser texto'})
    @MinLength(2, {message: 'El nombre debe tener al menos 2 caracteres'})
    @MaxLength(50, {message: 'El nombre debe tener máximo 50 caracteres'})
    nombre: string;

    @IsNotEmpty({message: 'El apellido es obligatorio'})
    @IsString({message: 'El apellido debe ser texto'})
    @MinLength(2, {message: 'El apellido debe tener al menos 2 caracteres'})
    @MaxLength(50, {message: 'El apellido debe tener máximo 50 caracteres'})
    apellido: string;

    @IsNotEmpty({message: 'El email es obligatorio'})
    @IsEmail({},{message: 'El email debe ser válido'})
    email: string;

    @IsNotEmpty({message: 'El nombre de usuario es obligatorio'})
    @IsString({message: 'El nombre de usuario debe ser texto'})
    @MinLength(3, {message: 'El nombre de usuario debe tener al menos 3 caracteres'})
    @MaxLength(20, {message: 'El nombre de usuario debe tener máximo 20 caracteres'})
    @Matches(/^[a-zA-Z0-9_]*$/, {message: 'El nombre de usuario solo puede contener letras, números y guiones bajos'})
    username: string;

    @IsNotEmpty({message: 'La contraseña es obligatoria'})
    @MinLength(8, {message: 'La contraseña debe tener al menos 8 caracteres'})
    @Matches(/(?=.*[A-Z])/, { message: 'Debe tener una mayúscula' })
    @Matches(/(?=.*\d)/, { message: 'Debe tener un número' })
    password: string;
    
    @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
    @IsDateString({}, { message: 'Debe tener formato YYYY-MM-DD' })
    fechaNacimiento: string;

    @IsOptional()
    @IsString({message: 'La descripción debe ser texto'})
    descripcion: string;
}