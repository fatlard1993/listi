import socketClient from 'socket-client';

import listi from 'listi';

listi.views.filter_edit = function ({ name, items }) {
	listi.drawToolkit([{ id: 'lists', onPointerPress: socketClient.reply.bind(this, 'list', name) }]);
};
