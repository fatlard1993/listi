import socketClient from 'socket-client';

import listi from 'listi';

listi.views.filter_edit = function (list) {
	listi.drawToolkit([{ id: 'lists', onPointerPress: socketClient.reply.bind(this, 'list', list.name) }]);
};
