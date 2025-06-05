import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
//import { UsersController } from './users.controller';   
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService],
  //controllers: [UsersController],
  exports: [UsersService], // para que otros módulos (como auth) puedan usarlo
})
export class UsersModule {}