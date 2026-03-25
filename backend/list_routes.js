const express = require('express');
const studentRoutes = require('./routes/studentRoutes');
const app = express();
app.use('/api/student', studentRoutes);

console.log('--- Registered Student Routes ---');
app._router.stack.forEach(middleware => {
    if (middleware.name === 'router') {
        middleware.handle.stack.forEach(handler => {
            if (handler.route) {
                const path = handler.route.path;
                const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
                console.log(`${methods} /api/student${path}`);
            }
        });
    }
});
