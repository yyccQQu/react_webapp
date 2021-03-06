import React from 'react';
import ReactDom from 'react-dom';

import { Provider } from 'react-redux';
import Main from './Main/Main.jsx';


ReactDom.render(
    <Provider>
        <Main />
    </Provider>,
    document.getElementById('root')
)