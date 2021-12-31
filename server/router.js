const path = require('path');

const router = {
	init({ express, app }) {
		app.use(express.static(path.join(__dirname, '..', 'client/dist')));
	},
};

module.exports = router;
