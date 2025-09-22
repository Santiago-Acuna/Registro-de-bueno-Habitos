import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isImageFile', async: false })
class IsImageFileConstraint implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File, args: ValidationArguments) {
    if (!file) {
      return false; // El archivo no existe
    }

    const { allowedMimeTypes, maxSize } = args.constraints[0];

    // Validar tipo MIME
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return false;
    }

    // Validar tamaño
    if (file.size > maxSize) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const { allowedMimeTypes, maxSize } = args.constraints[0];
    const fileName = args.property;

    if (!allowedMimeTypes.includes(args.value.mimetype)) {
      return `${fileName} debe ser un archivo de imagen válido (${allowedMimeTypes.join(', ')}).`;
    }
    if (args.value.size > maxSize) {
      return `${fileName} excede el tamaño máximo permitido de ${maxSize / (1024 * 1024)}MB.`;
    }
    return 'El archivo no es válido.';
  }
}

export function IsImageFile(
  options: { allowedMimeTypes: string[]; maxSize: number },
  validationOptions: ValidationOptions
) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsImageFileConstraint,
    });
  };
}
