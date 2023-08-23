import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common/services';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';
import { AppModule } from './app.module';
import { SwaggerTagsEnum } from './utils/swagger.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Message correlator')
    .setDescription(
      'This document provides all the information needed to work with the correlator API.',
    )
    .setVersion('1.0')
    .addTag(SwaggerTagsEnum.Message)
    .addTag(SwaggerTagsEnum.Subscription)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);
}
const logger = new Logger('MAIN');
bootstrap().then(() => logger.log('Server listening 👍: ' + process.env.PORT));
