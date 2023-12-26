import { Injectable } from '@nestjs/common';

@Injectable()
export class AppConfigService {
	private config = {
		// your initial configuration values
		APP_NAME: 'RS User',
		PORT: 4040,
		// ... other configuration variables
	};

	get(key: string): any {
		return this.config[key];
	}

	set(key: string, value: any): void {
		this.config[key] = value;
	}
}
