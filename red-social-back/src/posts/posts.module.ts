
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostController } from './posts.controller';
import { PostService } from './post.service';
import { Post, PostSchema } from './schemas/post.schema';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';


@Module({
    imports: [
        MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
        UsersModule,
        AuthModule
    ],
    controllers: [PostController],
    providers: [PostService],
})

export class PostsModule {}