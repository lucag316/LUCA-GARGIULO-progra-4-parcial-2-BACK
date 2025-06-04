import { Module } from '@nestjs/common';
//import { AppController } from './app.controller';
//import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config'; // lo agrego el profe
import { MongooseModule } from '@nestjs/mongoose'; // lo agrego el profe
import { ThrottlerModule, ThrottlerGuard, ThrottlerModuleOptions } from '@nestjs/throttler'; // lo agrego el profe
import { APP_GUARD } from '@nestjs/core'; // lo agrego el profe

@Module({
    imports: [
        // configuracion global
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        // configuracion mongo
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('DATABASE_URL'),
                retryWrites: true,
                w: 'majority',
            }),
            inject: [ConfigService],
        }),
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) : ThrottlerModuleOptions => ({
                throttlers: [
                    {
                        limit: Number(configService.get('THROTTLE_LIMIT', 10)),
                        ttl: Number(configService.get('THROTTLE_TTL', 60)),
                    },
                    
                ],
            }),
            inject: [ConfigService],
        }),
    ],

    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})


export class AppModule {}
