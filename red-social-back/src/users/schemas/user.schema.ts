
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type UserDocument = User & Document;

@Schema({ 
    timestamps: true,
    versionKey: false,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

export class User {
    
    @Prop({ required: true, trim: true })
    nombre: string;

    @Prop({ required: true, trim: true })
    apellido: string;

    @ApiProperty({example: 'xxXxx@example.com'})
    @Prop({ required: true, unique: true, trim: true, lowercase: true })
    email: string;

    @ApiProperty({example: 'xxXxxxxx0000'})
    @Prop({ required: true, unique: true, trim: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    fechaNacimiento: Date;

    @Prop()
    descripcion: string;

    // SOLUCIÓN PARA imagenPerfil:
    @Prop({ 
        type: String,  // Tipo explícito para Mongoose
        default: null, // Valor por defecto
        required: false // Campo opcional
    })
    imagenPerfil?: string; // El "?" indica que es opcional en TypeScript

    @Prop({ default: 'usuario' })
    perfil: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);


// lo comento porque ya estoy usando unique
// UserSchema.index({ username: 1 });
// UserSchema.index({ email: 1 });