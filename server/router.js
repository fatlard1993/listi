const router = {
	init({ express, app }) {
		app.use(express.static('../client/dist'));
	},
};

export default router;
