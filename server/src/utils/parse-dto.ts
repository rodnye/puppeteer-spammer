import { validate, validateSync } from 'class-validator';
import { ClassConstructor, plainToInstance } from 'class-transformer';

export function parseDto<T extends object>(
  DtoClass: ClassConstructor<T>,
  plainObject: any
): T {
  const dto = plainToInstance(DtoClass, plainObject);
  const errors = validateSync(dto);

  if (errors.length > 0) {
    throw errors;
  }

  return dto;
}
