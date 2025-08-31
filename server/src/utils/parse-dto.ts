import { validate } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export async function parseDto<T extends object>(
  DtoClass: ClassConstructor<T>,
  plainObject: any
): Promise<T> {
  const dto = plainToInstance(DtoClass, plainObject);
  const errors = await validate(dto);

  if (errors.length > 0) {
    throw errors;
  }

  return dto;
}
