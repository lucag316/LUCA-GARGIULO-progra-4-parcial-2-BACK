import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PostService } from 'src/posts/post.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly postService: PostService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    return this.usersService.getCurrentUser(req.user.sub);
  }

  @Get('me/posts')
  @UseGuards(JwtAuthGuard)
  async getUserPosts(@Request() req) {
    return this.usersService.getUserPosts(req.user.sub);
  }
}