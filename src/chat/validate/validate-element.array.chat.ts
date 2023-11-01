import {
	ValidatorConstraint,
	ValidatorConstraintInterface,
	ValidationArguments
} from 'class-validator';
import { ID_REGEX } from 'src/user/regex/regex.const';

@ValidatorConstraint({ name: 'isValidUserFormat', async: false })
export class IsValidUserFormatValidator
	implements ValidatorConstraintInterface
{
	validate(value: any, args: ValidationArguments) {
		const users = value;
		for (const user of users) {
			if (
				typeof user !== 'string' ||
				user.length !== 25 ||
				!ID_REGEX.test(user)
			) {
				return false;
			}
		}
		return true;
	}

	defaultMessage(args: ValidationArguments) {
		return `Недопустимый формат элемента в поле ${args.property}.`;
	}
}
