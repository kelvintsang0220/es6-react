/**
 * Created by fongwell on 2016/9/21.
 */
import React from 'react';
import Router from 'react-router';
import routes from './routes';

Router.run(routes, Router.HistoryLocation, function(Handler) {
    React.render(<Handler />, document.getElementById('app'));
});


