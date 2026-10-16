import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  type CreateUserDto,
  type UpdateUserDto,
} from './users.schemas.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body({ schema: createUserSchema }) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', { schema: userIdSchema }) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', { schema: userIdSchema }) id: number,
    @Body({ schema: updateUserSchema }) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', { schema: userIdSchema }) id: number) {
    return this.usersService.remove(id);
  }
}
