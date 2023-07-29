import { Todo } from '../todo.entity';

export class ResponseTodo implements Todo {
  id!: string;
  title!: string;
  description!: string;
  createdAt!: Date;
  createdById!: string;
}
