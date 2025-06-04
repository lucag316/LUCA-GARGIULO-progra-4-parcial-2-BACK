import { Module } from '@nestjs/common';
//import { AppController } from './app.controller';
//import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config'; // lo agrego el profe
import { MongooseModule } from '@nestjs/mongoose'; // lo agrego el profe
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // lo agrego el profe
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
      uri: ConfigService.get<string>('DATABASE_URL'),
      retryWrites: true,
      w: 'majority',
    })
  ],
})
export class AppModule {}
