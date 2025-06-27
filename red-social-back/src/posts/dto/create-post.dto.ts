/**
 * DTO para la creación de publicaciones (`/posts`).
 * 
 * Valida los datos enviados desde el frontend al crear una publicación.
 * Incluye:
 * - `titulo`: requerido, debe ser texto.
 * - `descripcion`: requerida, debe ser texto.
 * - `imagenUrl`: opcional, texto que representa la URL de la imagen.
 *
 * Este DTO es usado en el controlador para asegurar que los datos sean correctos
 * antes de pasar al servicio y persistir en la base de datos.
 */
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import {  ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePostDto {

    // Título obligatorio: debe ser texto no vacío
    @ApiProperty({example: 'titulo de post'})
    @IsString({message: 'El título debe ser texto'})
    @IsNotEmpty({message: 'El título es obligatorio'})
    titulo: string;

    // Descripción obligatoria: debe ser texto no vacío
    @ApiProperty({example: 'descripcion de post'})
    @IsString({message: 'La descripción debe ser texto'})
    @IsNotEmpty({message: 'La descripción es obligatoria'})
    descripcion: string;

    // URL de imagen: opcional, si se envía debe ser texto
    @ApiPropertyOptional({example: 'https://example.com/imagen.jpg'})
    @IsOptional({message: 'La URL de la imagen es opcional'})
    @IsString({message: 'La URL de la imagen debe ser texto'})
    imagenUrl?: string;
}