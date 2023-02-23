import { Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}
      
    @Post()
    @UsePipes(ValidationPipe)
    @ApiOperation({
        summary: 'Create a user'
    })
    async create(@Body() createUserDto: CreateUserDto) {
      return this.userService.create(createUserDto);
    }
  }