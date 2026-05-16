import items from '../database/items';

import requestMatch from '../utils/requestMatch';

const itemsRouter = async request => {
	let match;

	match = requestMatch('GET', '/items', request);
	if (match) return Response.json(items.read(match));

	match = requestMatch('POST', '/items', request);
	if (match) return Response.json(items.create(await request.json()), { status: 201 });

	match = requestMatch('GET', '/items/:id', request);
	if (match) {
		const item = items.read(match);

		return item ? Response.json(item) : new Response(null, { status: 404 });
	}

	match = requestMatch('PUT', '/items/:id', request);
	if (match) {
		const item = items.update({ ...match, update: await request.json() });

		return item ? Response.json(item) : new Response(null, { status: 404 });
	}

	match = requestMatch('DELETE', '/items/:id', request);
	if (match) return new Response(null, { status: items.delete(match) ? 204 : 404 });
};

export default itemsRouter;
