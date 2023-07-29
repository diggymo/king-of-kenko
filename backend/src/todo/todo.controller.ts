import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodo } from './dto/create-todo.dto';
import { UpdateTodo } from './dto/update-todo.dto';
import { AuthorizedUser, UserType } from 'src/user/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiBearerAuth, ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseTodo } from './dto/response-todo.dto';
import { PaginationRequestDto } from 'src/helpers/pagination.dto';

@ApiTags('todos')
@ApiBearerAuth()
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  /**
   * TODOを作成します
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: ResponseTodo })
  create(@Body() createTodoDto: CreateTodo, @AuthorizedUser() user: UserType) {
    return this.todoService.create(user.userId, createTodoDto) as Promise<ResponseTodo>;
  }

  /**
   * TODOを一覧で取得します。<br/>
   * クエリパラメータで取得する範囲を指定することができます。<br/>
   * また、一覧の並び順は登録日の降順（新しい順）です。
   */
  @Get()
  @ApiResponse({ type: ResponseTodo, isArray: true })
  @UseGuards(JwtAuthGuard)
  findAll(@AuthorizedUser() user: UserType, @Query() pagination: PaginationRequestDto) {
    return this.todoService.findAll(user.userId, pagination.limit, pagination.offset) as Promise<ResponseTodo[]>;
  }

  /** 指定した単一のTODOを取得します */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ type: ResponseTodo })
  findOne(@Param('id') id: string, @AuthorizedUser() user: UserType) {
    return this.todoService.findOne(user.userId, id) as Promise<ResponseTodo>;
  }

  /** 指定した単一のTODOを更新します */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ type: ResponseTodo })
  @HttpCode(HttpStatus.NO_CONTENT)
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodo, @AuthorizedUser() user: UserType) {
    return this.todoService.update(user.userId, id, updateTodoDto) as Promise<ResponseTodo>;
  }

  /** 指定した単一のTODOを削除します */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @AuthorizedUser() user: UserType) {
    return this.todoService.remove(user.userId, id);
  }
}
