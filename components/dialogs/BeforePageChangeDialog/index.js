import ModalDialog from '../ModalDialog';

export default class BeforePageChangeDialog extends ModalDialog {
	constructor({ onYes = () => {}, isDirty = () => true, ...rest }) {
		super({
			header: 'Attention',
			content: 'Are you sure you want to leave without saving your changes?',
			buttons: ['yes', 'no'],
			onDismiss: ({ button, closeDialog }) => {
				if (button === 'yes') onYes();

				closeDialog();
			},
			...rest,
		});

		if (!isDirty()) {
			onYes();

			this.cleanup();
		}
	}
}
