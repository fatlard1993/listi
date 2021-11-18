import listi from '../../../listi';
import View from '../View';

export default class UnloadAwareView extends View {
	constructor({ onBeforeunload = () => {}, isDirty = () => true, className, ...rest }) {
		super({ className: ['unloadAwareView', className], ...rest });

		this.onBeforeunload = onBeforeunload;
		this.isDirty = isDirty;

		window.addEventListener('beforeunload', evt => this._onBeforeunload(evt));
	}

	cleanup() {
		window.removeEventListener('beforeunload', evt => this._onBeforeunload(evt));

		super.cleanup();
	}

	_onBeforeunload(evt) {
		if (listi.isDev || !this.isDirty()) return;

		this.onBeforeunload(evt);

		evt.returnValue = null;
		return null;
	}
}
