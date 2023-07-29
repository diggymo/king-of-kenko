import { IsNotEmpty, MaxLength } from 'class-validator';
import { SkipWhenUndefined } from 'src/helpers/SkipWhenUndefined';

/**
 * TODOの更新
 * NOTE: PartialClassを利用するとnull許容になってしまうため再利用せず再定義
 */
export class UpdateTodo {
  @SkipWhenUndefined()
  @IsNotEmpty({ message: 'タイトルは入力してください' })
  @MaxLength(255, {
    message: 'タイトルは$constraint1文字以内にして下さい',
  })
  title?: string;

  @SkipWhenUndefined()
  @IsNotEmpty({ message: '説明は入力してください' })
  @MaxLength(10000, {
    message: '説明は$constraint1文字以内にして下さい',
  })
  description?: string;
}
