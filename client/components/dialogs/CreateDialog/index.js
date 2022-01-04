import router from '../../../router';

import ModalDialog from '../ModalDialog';

export default class CreateDialog extends ModalDialog {
	constructor({ ...rest }) {
		super({
			header: 'Create',
			content: 'Create a new Filter or Item?',
			buttons: ['Filter', 'Item', 'Cancel'],
			onDismiss: ({ button, closeDialog }) => {
				if (button === 'Filter') {
					router.path = router.buildPath(router.ROUTES.filterEdit, { id: 'new' });
				} else if (button === 'Item') {
					router.path = router.buildPath(router.ROUTES.itemEdit, { id: 'new' });
				}

				closeDialog();
			},
			...rest,
		});
	}
}
