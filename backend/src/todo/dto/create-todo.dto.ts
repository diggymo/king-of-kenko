import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** TODOの登録 */
export class CreateTodo {
  @IsString()
  @IsNotEmpty({ message: 'タイトルは入力してください' })
  @MaxLength(255, {
    message: 'タイトルは$constraint1文字以内にして下さい',
  })
  title!: string;

  @IsString()
  @IsNotEmpty({ message: '説明は入力してください' })
  @MaxLength(10000, {
    message: '説明は$constraint1文字以内にして下さい',
  })
  description!: string;
}
