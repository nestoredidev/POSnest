import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio.' })
  @IsString({ message: 'Nombre no valido' })
  name: string;

  @IsNotEmpty({ message: 'La imagen es obligatorio' })
  image: string;

  @IsNotEmpty({ message: 'La descripción del producto es obligatoria.' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Precio no valido' })
  price: number;

  @IsNotEmpty({ message: 'La cantidad del producto es obligatoria.' })
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'Cantidad no valida' })
  inventory: number;

  @IsNotEmpty({ message: 'La categoría del producto es obligatoria.' })
  @IsNumber({ maxDecimalPlaces: 0 }, { message: 'ID de categoría no válido' })
  categoryId: number;
}
