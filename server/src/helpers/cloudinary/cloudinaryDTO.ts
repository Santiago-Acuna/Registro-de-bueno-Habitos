import { IsNotEmpty } from 'class-validator';
import { Express } from 'express';

import { IsImageFile } from '../../common/validators/is-image-file.validator';

export class UploadImageDto {
  @IsNotEmpty({ message: 'El archivo de imagen no puede estar vacío.' })
  @IsImageFile(
    {
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      maxSize: 5 * 1024 * 1024, // 5 MB
    },
    {
      message: 'Invalid image format',
    }
  )
  image!: Express.Multer.File; // El tipo de Multer.File es importante aquí
}
