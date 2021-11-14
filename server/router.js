const express = require('express');

const { rootPath, app } = require('./listi');

app.use(express.static(rootPath('client/dist')));
