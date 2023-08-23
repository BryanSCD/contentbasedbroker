import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CorrelatorModule } from './modules/correlator/correlator.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppLoggerMiddleware } from './middlewares/app-logger.middleware';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://admin:admin@localhost:27017/'),
    ConfigModule.forRoot(),
    CorrelatorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
