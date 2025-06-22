
import { IsEnum, IsNumber, IsOptional, isString, IsString, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export enum SortBy{
    DATE = 'date',
    LIKES = 'likes'
}

export class GetPostDto{
    @ApiPropertyOptional({enum: SortBy, default: SortBy.DATE, description: 'Ordenamiento por fecha o likes'})
    @IsOptional({message: 'El ordenamiento es opcional'})
    @IsString({message: 'El ordenamiento debe ser texto'})
    @IsEnum(SortBy)
    sortBy?: SortBy = SortBy.DATE;

    @ApiPropertyOptional({description: 'Filtrar por ID de usuario'})
    @IsString({message: 'El ID de usuario debe ser texto'})
    @IsOptional({message: 'El ID de usuario es opcional'})
    usuarioId?: string;

    @ApiPropertyOptional({description: 'OffSet para paginacion', default: 0})
    @Type(() => Number)
    @IsOptional({message: 'El offset es opcional'})
    @IsNumber({}, {message: 'El offset debe ser un número'})
    @Min(0, {message: 'El offset debe ser mayor o igual a 0'})
    offset?: number = 0;

    @ApiPropertyOptional({description: 'Limit para paginacion', default: 10})
    @Type(() => Number)
    @IsOptional({message: 'El limit es opcional'})
    @IsNumber({}, {message: 'El limit debe ser un número'})
    @Min(1, {message: 'El limit debe ser mayor o igual a 1'})
    limit?: number = 10;
}