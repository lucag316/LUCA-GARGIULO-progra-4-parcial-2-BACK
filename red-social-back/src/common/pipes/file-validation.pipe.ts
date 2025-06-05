
import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class FileValidationPipe implements PipeTransform {
    transform(file: Express.Multer.File) {
        // la imagen es opcional

        if(!file) {
            return null;
        }

        // tipo de archivo permitidos

        const allowedMimeTypes = ['image/jpeg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        // tamaño maximo: 5MG

        const maxSize = 5 * 1024 * 1024;

        // validar tipos de archivo

        if(!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('El archivo debe ser una imagen (JPEG, JPG, PNG, GIF, WEBP)');
        }

        // validar tamaño
        if (file.size > maxSize) {
            throw new BadRequestException('La imagen no debe superar los 5MB');
        }

        return file;

    }
}