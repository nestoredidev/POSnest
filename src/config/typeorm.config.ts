import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

export const typeOrmConfig = (
  confiService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: confiService.get('DATABASE_HOST'),
  port: +confiService.get('DATABASE_PORT'),
  username: confiService.get('DATABASE_USER'),
  password: confiService.get('DATABASE_PASS'),
  database: confiService.get('DATABASE_NAME'),
  ssl: true,
  logging: true,
  entities: [join(__dirname + '../../**/*.entity.{ts,js}')],
  synchronize: false,
});
