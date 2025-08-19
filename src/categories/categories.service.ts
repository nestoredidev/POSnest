import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { FindManyOptions, Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.categoryRepository.save(createCategoryDto);
  }

  findAll() {
    return this.categoryRepository.find();
  }

  async findOne(id: number, products?: string) {
    const options: FindManyOptions<Category> = {
      where: { id },
    };
    if (products === 'true') {
      options.relations = { products: true };
      options.order = {
        products: {
          id: 'DESC',
        },
      };
    }
    const category = await this.categoryRepository.findOne(options);
    if (!category) {
      throw new NotFoundException(`La categoría con id ${id} no existe`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`La categoría con id ${id} no existe`);
    }
    const update = await this.categoryRepository.update(id, updateCategoryDto);
    if (update.affected === 0) {
      throw new HttpException('No se pudo actualizar la categoría', 500);
    }
    return category;
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) {
      throw new NotFoundException(`La categoría con id ${id} no existe`);
    }
    const result = await this.categoryRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException('No se pudo eliminar la categoría', 500);
    }

    return category;
  }
}
