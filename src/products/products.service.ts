import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryService: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const category = await this.categoryService.findOneBy({
      id: createProductDto.categoryId,
    });
    if (!category) {
      throw new NotFoundException(
        `Categoria con ID ${createProductDto.categoryId} no existe`,
      );
    }

    const product = this.productRepository.create({
      ...createProductDto,
      category,
    });
    return this.productRepository.save(product);
  }

  async findAll(categoryId: number, take: number, skip: number) {
    const options: FindManyOptions<Product> = {
      relations: {
        category: true,
      },
      order: {
        id: 'DESC',
      },
      take: take,
      skip: skip,
    };

    if (categoryId) {
      options.where = {
        category: {
          id: categoryId,
        },
      };
    }

    const [products, total] =
      await this.productRepository.findAndCount(options);
    return {
      products,
      total,
    };
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        category: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    const category = await this.categoryService.findOneBy({
      id: updateProductDto.categoryId,
    });
    if (!category) {
      throw new NotFoundException(
        `Categoria con ID ${updateProductDto.categoryId} no existe`,
      );
    }
    const updatedProduct = this.productRepository.merge(product, {
      ...updateProductDto,
      category,
    });
    return this.productRepository.save(updatedProduct);
  }

  async remove(id: number) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    await this.productRepository.remove(product);

    return {
      message: `Producto  eliminado correctamente`,
    };
  }
}
