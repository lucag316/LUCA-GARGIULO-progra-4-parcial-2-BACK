import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
    @ApiProperty({example: 'titulo de post'})
    @Prop({required: true})
    titulo: string;

    @ApiProperty({example: 'descripcion de post'})
    @Prop({required: true})
    descripcion: string;

    @ApiProperty({example: 'https://example.com/imagen.jpg'})
    @Prop()
    imagenUrl: string;

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
    @Prop({default: new Date()})
    fechaCreacion: Date;

    @ApiProperty({example: '2025-01-01T00:00:00.000Z'})
    @Prop({default: new Date()})
    fechaActualizacion: Date;

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


export const PostSchema = SchemaFactory.createForClass(Post);
