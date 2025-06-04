import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // lo agrego el profe
import { join } from 'path'; // lo agrego el profe
import { NestExpressApplication } from '@nestjs/platform-express'; // lo agrego el profe

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule); // <NestExpressApplication> lo agrego el profe, usa interface
    
    //validacion global de DTOs

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
    }));

    //servir archivo estatico (imagen de perfil )

    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });

    // habilitar CORS

    app.enableCors()




    await app.listen(3000);
    console.log("Servidor red-social-back corriendo en http://localhost:" + process.env.PORT);
}
bootstrap();
