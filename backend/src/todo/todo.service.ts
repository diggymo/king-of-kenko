import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTodo } from './dto/create-todo.dto';
import { UpdateTodo } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(private prismaService: PrismaService) {}

  create(createdById: string, createTodoDto: CreateTodo) {
    return this.prismaService.todo.create({
      data: { ...createTodoDto, createdById: createdById },
    });
  }

  findAll(createdById: string, limit = 15, offset = 0) {
    return this.prismaService.todo.findMany({
      where: { createdById },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(createdById: string, id: string) {
    return this.prismaService.todo.findFirstOrThrow({ where: { id, createdById } });
  }

  async update(createdById: string, id: string, updateTodoDto: UpdateTodo) {
    const todo = await this.findOne(createdById, id);
    return this.prismaService.todo.update({
      where: {
        id: todo.id,
      },
      data: updateTodoDto,
    });
  }

  async remove(createdById: string, id: string) {
    const todo = await this.findOne(createdById, id);
    await this.prismaService.todo.delete({
      where: { id: todo.id },
    });
  }
}
