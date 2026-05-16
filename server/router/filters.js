import filters from '../database/filters';

import requestMatch from '../utils/requestMatch';

const filtersRouter = async request => {
	let match;

	match = requestMatch('GET', '/filters', request);
	if (match) return Response.json(filters.read(match));

	match = requestMatch('POST', '/filters', request);
	if (match) return Response.json(filters.create(await request.json()), { status: 201 });

	match = requestMatch('GET', '/filters/:id', request);
	if (match) {
		const item = filters.read(match);

		return item ? Response.json(item) : new Response(null, { status: 404 });
	}

	match = requestMatch('POST', '/filters/:id/run', request);
	if (match) return Response.json(filters.run({ ...match, ...(await request.json().catch(() => ({}))) }));

	match = requestMatch('PUT', '/filters/:id', request);
	if (match) {
		const item = filters.update({ ...match, update: await request.json() });

		return item ? Response.json(item) : new Response(null, { status: 404 });
	}

	match = requestMatch('DELETE', '/filters/:id', request);
	if (match) return new Response(null, { status: filters.delete(match) ? 204 : 404 });
};

export default filtersRouter;
