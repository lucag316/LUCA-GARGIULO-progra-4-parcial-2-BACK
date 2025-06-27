/**
 * Esquema Mongoose del modelo `Post`.
 * Representa una publicación en la red social.
 *
 * Campos:
 * - `titulo` y `descripcion`: información textual obligatoria.
 * - `imagenUrl`: opcional, permite asociar una imagen a la publicación.
 * - `autor`: referencia al usuario creador del post.
 * - `likes`: array de IDs de usuarios que le dieron "Me gusta".
 * - `comentarios`: subdocumentos con contenido, autor y fecha.
 * - `estaEliminado`: usado para baja lógica.
 * - `fechaCreacion` y `fechaActualizacion`: timestamps adicionales.
 *
 * Configuración:
 * - `timestamps: true` agrega automáticamente `createdAt` y `updatedAt` (ya manejado por Mongoose).
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';

// Tipo para trabajar con el documento en servicios
export type PostDocument = Post & Document;

// Define el schema principal
@Schema({ 
        timestamps: true, // Agrega createdAt y updatedAt automáticamente
        toJSON: { virtuals: true },  // Incluye virtuals al convertir a JSON
        toObject: { virtuals: true } // Incluye virtuals al convertir a objeto
    }) 
export class Post {
    @ApiProperty({example: 'titulo de post'})
    @Prop({required: true, trim: true})
    titulo: string;

    @ApiProperty({example: 'descripcion de post'})
    @Prop({required: true})
    descripcion: string;

    @ApiProperty({
        example: 'https://example.com/imagen.jpg',
        description: 'URL de imagen opcional',
        required: false
    })
    @Prop()
    imagenUrl?: string;

    @ApiProperty({example: '64d5bf7f7f7f7f7f7f7f7f7f'})
    @Prop({required: true, type: MongooseSchema.Types.ObjectId, ref: 'User'})
    autor: string;

    @ApiProperty({example: false})
    @Prop({ default: false })
    estaEliminado: boolean;

    @ApiProperty({example: '[64d5bf7f7f7f7f7f7f7f7f7f, 64d5bf7f7f7f7f7f7f7f7f7f]'})
    @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'User' }])
    likes: User[];

    @ApiProperty({example: '2025-01-01T00:00:00.000Z'})
    @Prop({default: Date.now})
    fechaCreacion: Date; // DESPUES FIJAREME DE ELIMINARLOS Y USO EL TIME STAMP

    @ApiProperty({example: '2025-01-01T00:00:00.000Z'})
    @Prop({default: Date.now})
    fechaActualizacion: Date; // ESTE TAMBIEN

    @ApiProperty({
        example: [
        {
            contenido: 'Buen post!',
            autor: '64d5bf7f7f7f7f7f7f7f7f7f',
            fechaCreacion: '2025-01-01T00:00:00.000Z'
        }
        ]
    })
    @Prop([
        {
        contenido: { type: String, required: true },
        autor: { type: MongooseSchema.Types.ObjectId, ref: 'User', required: true },
        fechaCreacion: { type: Date, default: Date.now }
        }
    ])
    comentarios: {
        contenido: string;
        autor: User;
        fechaCreacion: Date;
    }[];
}

// Genera el schema Mongoose
export const PostSchema = SchemaFactory.createForClass(Post);
