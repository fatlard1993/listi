import { GET, POST, PUT, DELETE } from 'vanilla-bean-components';

export const getItems = async options => await GET('/items', options);

export const getItem = async (id, options) => await GET(`/items/${id}`, options);

export const createItem = async options => await POST(`/items`, options);

export const updateItem = async (id, options) => await PUT(`/items/${id}`, options);

export const deleteItem = async (id, options) => await DELETE(`/items/${id}`, options);
