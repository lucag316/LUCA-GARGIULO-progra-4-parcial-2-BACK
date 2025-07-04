import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // lo agrego el profe
import { join } from 'path'; // lo agrego el profe
import { NestExpressApplication } from '@nestjs/platform-express'; // lo agrego el profe
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

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

    // CORS
    app.enableCors({
        origin: 'http://localhost:4200',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH','OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });



    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Servidor red-social-back corriendo en http://localhost:${port}`);

    // Configuración de Swagger
    const config = new DocumentBuilder()
        .setTitle('API de Ejemplo')
        .setDescription('Documentación de la API')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('users') // Etiqueta para agrupar los endpoints
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document); // Accede a la documentación en /api

    //await app.listen(3000);
}
bootstrap();
