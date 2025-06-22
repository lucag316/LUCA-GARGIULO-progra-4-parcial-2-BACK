import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import {  ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePostDto {
    @ApiProperty({example: 'titulo de post'})
    @IsString({message: 'El título debe ser texto'})
    @IsNotEmpty({message: 'El título es obligatorio'})
    titulo: string;

    @ApiProperty({example: 'descripcion de post'})
    @IsString({message: 'La descripción debe ser texto'})
    @IsNotEmpty({message: 'La descripción es obligatoria'})
    descripcion: string;

    @ApiPropertyOptional({example: 'https://example.com/imagen.jpg'})
    @IsOptional({message: 'La URL de la imagen es opcional'})
    @IsString({message: 'La URL de la imagen debe ser texto'})
    imagenUrl?: string;
}