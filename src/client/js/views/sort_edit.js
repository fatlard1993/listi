import socketClient from 'socket-client';

import listi from 'listi';

listi.views.sort_edit = function(list){
	listi.drawToolkit([
		{
			id: 'lists',
			onPointerPress: () => {
				socketClient.reply('list', list.name);
			}
		}
	]);
};