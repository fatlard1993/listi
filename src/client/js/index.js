import dom from 'dom';

import listi from 'listi';
import 'views/index';

document.oncontextmenu = evt => {
	evt.preventDefault();
};

dom.onLoad(listi.init);
