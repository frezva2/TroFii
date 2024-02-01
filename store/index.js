import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers from '../reducers';

const store = createStore(
	reducers,
	{},
	compose(
			applyMiddleware(thunk)
		)
	);

// Delete the save state
// persistStore(store, { storage: AsyncStorage, whitelist: ['likedJobs'] }).purge();

export default store;
