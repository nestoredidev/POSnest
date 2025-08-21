import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';
import { endOfDay, isAfter } from 'date-fns';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async create(createCouponDto: CreateCouponDto) {
    await this.couponRepository.save(createCouponDto);
    return {
      message: `Cupón ${createCouponDto.name} creado correctamente`,
      coupon: createCouponDto,
    };
  }

  async findAll() {
    return await this.couponRepository.find();
  }

  async findOne(id: number) {
    const coupon = await this.couponRepository.findOneBy({ id });
    if (!coupon) {
      throw new NotFoundException(`Coupon with id ${id} not found`);
    }
    return coupon;
  }

  async update(id: number, updateCouponDto: UpdateCouponDto) {
    const coupon = await this.couponRepository.findOneBy({ id });
    if (!coupon) {
      throw new NotFoundException(`Coupon with id ${id} not found`);
    }
    Object.assign(coupon, updateCouponDto);
    await this.couponRepository.save(coupon);
    return { message: `Cupón actualizado correctamente`, coupon };
  }

  async remove(id: number) {
    const coupon = await this.couponRepository.findOneBy({ id });
    if (!coupon) {
      throw new NotFoundException(`Coupon with id ${id} not found`);
    }
    await this.couponRepository.remove(coupon);
    return { message: `Cupón eliminado correctamente` };
  }

  async applyCoupon(couponName: string) {
    const coupon = await this.couponRepository.findOneBy({ name: couponName });
    if (!coupon) {
      throw new NotFoundException(
        `Cupón con nombre ${couponName} no encontrado`,
      );
    }
    const currentDate = new Date();
    const expirationDate = endOfDay(coupon.expirationDate);
    if (isAfter(currentDate, expirationDate)) {
      throw new UnprocessableEntityException(
        `El cupón ${couponName} ha expirado`,
      );
    }
    return {
      message: `Cupón ${couponName} Valido`,
      ...coupon,
    };
  }
}
