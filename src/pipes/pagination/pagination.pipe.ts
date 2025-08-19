import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

interface PaginationQuery {
  limit?: string | number;
  offset?: string | number;
}

@Injectable()
export class PaginationPipe implements PipeTransform {
  transform(value: PaginationQuery) {
    const limit = parseInt(String(value.limit || '10')) || 10;
    const offset = parseInt(String(value.offset || '0')) || 0;

    if (limit < 1) {
      throw new BadRequestException('El límite debe ser mayor a 0');
    }

    if (offset < 0) {
      throw new BadRequestException('El offset debe ser mayor o igual a 0');
    }

    if (limit > 100) {
      throw new BadRequestException('El límite no puede ser mayor a 100');
    }

    return { limit, offset };
  }
}
