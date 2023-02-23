import { Body, Controller, Get, Post, UseGuards, UsePipes, ValidationPipe, Res, HttpStatus, Param, Query } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { PrincipalGuard } from 'src/auth/principal.guard';
import { UserResponseDto, UsersResponseDto } from './dto/user-api.dto';
import { UserQueryDto } from './dto/user-query.dto';

@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}
      
    @Post()
    @UsePipes(ValidationPipe)
    @ApiOperation({
        summary: 'Create a user'
    })
    @ApiCreatedResponse({
        status: HttpStatus.CREATED,
        description: 'User created successfully',
        type: UserResponseDto
    })
    async create(@Body() createUserDto: CreateUserDto, @Res() res: Response ) {
      const createdUser = await this.userService.create(createUserDto);

      return res.status(HttpStatus.CREATED).json({
        status: 'success',
        message: 'User created successfully',
        data: createdUser,
      }); 
    }

    @UseGuards(PrincipalGuard)
    @Get()
    @UsePipes(ValidationPipe)
    @ApiOperation({
        summary: 'fetch all users'
    })
    @ApiCreatedResponse({
        status: HttpStatus.OK,
        description: 'Users fetched successfully',
        type: UsersResponseDto
    })
    async findAll(@Query() query: UserQueryDto, @Res() res: Response) {
      const users = await this.userService.findAll(query.cursor, query.limit);
      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Users fetched',
        data: users,
      }); 
    }

    @UseGuards(PrincipalGuard)
    @Get(':id')
    @ApiOperation({
        summary: 'fetch a user'
    })
    @ApiCreatedResponse({
        status: HttpStatus.OK,
        description: 'User fetched successfully',
        type: UserResponseDto
    })
    async findOne(@Param() params: { id: string }, @Res() res: Response) {
      const user =  await this.userService.findOneById(params.id);

      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'User fetched',
        data: user,
      }); 
    }

  }