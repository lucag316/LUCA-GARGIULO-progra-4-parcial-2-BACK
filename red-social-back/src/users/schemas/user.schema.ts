
/**
 * Esquema Mongoose para el modelo `User`.
 * Representa la estructura del documento de usuario en la base de datos.
 * Incluye:
 * - Datos personales: nombre, apellido, email, username, fecha de nacimiento, descripción.
 * - Autenticación: password.
 * - Imagen de perfil (opcional).
 * - Rol/perfil de usuario (por defecto "usuario").
 * - Estado activo/inactivo (baja lógica).
 * 
 * Configuración adicional:
 * - timestamps: crea automáticamente `createdAt` y `updatedAt`.
 * - versionKey: desactivado para evitar el campo `__v`.
 * - toJSON/toObject con virtuals habilitados.
 */

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

// Tipo para usar en servicios con tipado fuerte
export type UserDocument = User & Document;

// Decorador de esquema con configuración global
@Schema({ 
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    versionKey: false, // Evita que se agregue __v
    toJSON: {virtuals: true}, // Habilita campos virtuales en respuestas JSON
    toObject: {virtuals: true}  // También para .toObject()
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

    
    @Prop({ 
        type: String,  
        default: null, 
        required: false 
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