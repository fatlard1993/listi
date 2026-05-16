import { View } from 'vanilla-bean-components';

export class Calendar extends View {
	constructor(options) {
		console.log('Calendar', options);
		super({
			...options,
		});
	}
}
