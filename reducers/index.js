import { combineReducers } from 'redux';
import auth from './auth_reducer';
import searchedWord_reducer from './searchedWord_reducer';

export default combineReducers({
	auth, searchedWord_reducer
});
