
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async create(data: Partial<User>) {
        return this.userModel.create(data);
    }

    async findByCorreoOrUsuario(value: string) {
        return this.userModel.findOne({
            $or: [{ email: value.toLowerCase() }, { username: value }],
        });
    }
}