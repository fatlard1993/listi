import View from '../View';

export default class UnloadAwareView extends View {
	constructor(options) {
		super(options);
	}

	render({ onBeforeunload = () => {}, isDirty = () => true, className, ...rest }) {
		super.render({ className: ['unloadAwareView', className], ...rest });

		this.onBeforeunload = onBeforeunload;
		this.isDirty = isDirty;

		window.addEventListener('beforeunload', evt => this._onBeforeunload(evt));
	}

	cleanup() {
		window.removeEventListener('beforeunload', evt => this._onBeforeunload(evt));

		super.cleanup();
	}

	_onBeforeunload(evt) {
		if (localStorage.getItem('dev') || !this.isDirty()) return;

		this.onBeforeunload(evt);

		evt.returnValue = null;

		return null;
	}
}
