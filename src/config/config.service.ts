import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigLoaderService {
	readonly messagePrivateKey: string;
	readonly messagePublicKey: string;
	readonly errorDefaultTimeFormat: string;
	readonly errorDefaultTimeTz: string;
	readonly errorDefaultMessage: string;
	readonly errorDefaultStatus: number;

	constructor(private readonly configService: ConfigService) {
		this.messagePrivateKey = this.getStringConfig('messagePrivateKey');
		this.messagePublicKey = this.getStringConfig('messagePublicKey');
		this.errorDefaultTimeFormat = this.getStringConfig(
			'errorDefaultTimeFormat'
		);
		this.errorDefaultTimeTz = this.getStringConfig('errorDefaultTimeTz');
		this.errorDefaultMessage = this.getStringConfig('errorDefaultMessage');
		this.errorDefaultStatus = this.getNumberConfig('errorDefaultStatus');
	}

	private getStringConfig(key: string): string {
		return this.configService.get<string>(key);
	}

	private getNumberConfig(key: string): number {
		return this.configService.get<number>(key);
	}
}
