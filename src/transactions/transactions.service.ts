import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Transaction,
  TransactionContents,
} from './entities/transaction.entity';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { endOfDay, isValid, parseISO, startOfDay } from 'date-fns';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionContents)
    private readonly transactionContentsRepository: Repository<TransactionContents>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly couponService: CouponsService,
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    await this.productRepository.manager.transaction(
      async (transactionEntityManager) => {
        const transaction = new Transaction();
        const total = createTransactionDto.contents.reduce(
          (total, contents) => total + contents.price * contents.quantity,
          0,
        );
        transaction.total = total;

        if (createTransactionDto.coupon) {
          const coupon = await this.couponService.applyCoupon(
            createTransactionDto.coupon,
          );
          const descount = (coupon.percentage / 100) * total;
          transaction.discount = descount;
          transaction.coupon = coupon.name;
          transaction.total -= descount;
        }

        for (const contents of createTransactionDto.contents) {
          const product = await transactionEntityManager.findOneBy(Product, {
            id: contents.productId,
          });
          const errors: string[] = [];

          if (!product) {
            errors.push(`El producto con ID ${contents.productId} no existe`);
            throw new NotFoundException(errors);
          }
          if (contents.quantity > product.inventory) {
            errors.push(
              `El producto ${product.name} no tiene suficiente inventario para la cantidad solicitada`,
            );
            throw new BadRequestException(errors);
          }
          product.inventory -= contents.quantity;

          // create a new TransactionContents instance
          const transactionContents = new TransactionContents();
          transactionContents.price = contents.price;
          transactionContents.product = product;
          transactionContents.quantity = contents.quantity;
          transactionContents.transaction = transaction;

          await transactionEntityManager.save(transaction);
          await transactionEntityManager.save(transactionContents);
        }
      },
    );
    return {
      message: `Venta creada correctamente`,
    };
  }

  async findAll(transactionDate: string) {
    const options: FindManyOptions<Transaction> = {
      relations: {
        contents: true,
      },
    };
    if (transactionDate) {
      const date = parseISO(transactionDate);
      if (!isValid(date)) {
        throw new BadRequestException('Fecha inválida');
      }
      const start = startOfDay(date);
      const end = endOfDay(date);
      options.where = {
        transactionDate: Between(start, end),
      };
    }
    return await this.transactionRepository.find(options);
  }

  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: {
        contents: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transacción con ID ${id} no encontrada`);
    }
    return transaction;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id}transaction`;
  }

  async remove(id: number) {
    const transaction = await this.findOne(id);

    for (const contents of transaction.contents) {
      const product = await this.productRepository.findOneBy({
        id: contents.product.id,
      });

      if (!product) {
        throw new NotFoundException(
          `Producto con ID ${contents.product.id} no encontrado`,
        );
      }

      product.inventory += contents.quantity;
      await this.productRepository.save(product);

      const transactionContents =
        await this.transactionContentsRepository.findOneBy({
          id: contents.id,
        });

      if (!transactionContents) {
        throw new NotFoundException(
          `Contenido de transacción con ID ${contents.id} no encontrado`,
        );
      }

      await this.transactionContentsRepository.remove(transactionContents);
    }

    await this.transactionRepository.remove(transaction);
    return {
      message: `Venta eliminada correctamente`,
    };
  }
}
