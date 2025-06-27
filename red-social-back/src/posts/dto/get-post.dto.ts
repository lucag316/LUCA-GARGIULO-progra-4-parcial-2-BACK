/**
 * DTO para obtener publicaciones (`GET /posts`).
 * 
 * Permite:
 * - Ordenar resultados por fecha o cantidad de likes.
 * - Filtrar publicaciones de un usuario específico por su ID.
 * - Controlar paginación mediante `offset` y `limit`.
 *
 * Este DTO se utiliza como query parameters en el controlador.
 */

import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

// Enum con las opciones válidas de ordenamiento
export enum SortBy{
    FECHA = 'fecha',
    LIKES = 'likes'
}

export class GetPostDto {

    // Permite ordenar por 'fecha' (default) o 'likes'
    @ApiPropertyOptional({enum: SortBy, default: SortBy.FECHA, description: 'Ordenamiento por fecha o likes'})
    @IsOptional({message: 'El ordenamiento es opcional'})
    @IsEnum(SortBy, { message: 'El ordenamiento debe ser "fecha" o "likes"' })
    orden?: SortBy = SortBy.FECHA;

    // Permite filtrar publicaciones de un usuario específico por su ID
    @ApiPropertyOptional({description: 'Filtrar por ID de usuario'})
    @IsString({message: 'El ID de usuario debe ser texto'})
    @IsOptional({message: 'El ID de usuario es opcional'})
    usuarioId?: string;

    // Offset de paginación: cuántos resultados omitir
    @ApiPropertyOptional({description: 'OffSet para paginacion', default: 0})
    @Type(() => Number)
    @IsOptional({message: 'El offset es opcional'})
    @IsNumber({}, {message: 'El offset debe ser un número'})
    @Min(0, {message: 'El offset debe ser mayor o igual a 0'})
    offset?: number = 0;

    // Límite de resultados por página
    @ApiPropertyOptional({description: 'Limit para paginacion', default: 10})
    @Type(() => Number)
    @IsOptional({message: 'El limit es opcional'})
    @IsNumber({}, {message: 'El limit debe ser un número'})
    @Min(1, {message: 'El limit debe ser mayor o igual a 1'})
    limit?: number = 10;
}