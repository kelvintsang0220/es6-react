/**
 * Created by fongwell on 2016/9/21.
 */
import React from 'react';
import {Route} from 'react-router';
import App from './components/App';
import Home from './components/Home';
import AddCharacter from './components/AddCharacter';

export default (
    <Route handler={App}>
        <Route path='/' handler={Home} />
        <Route path='/add' handler={AddCharacter} />
    </Route>
);