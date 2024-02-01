import { FACEBOOK_LOGIN_SUCCESS, FACEBOOK_LOGIN_FAIL, GOOGLE_LOGIN_SUCCESS, GOOGLE_LOGIN_FAIL, APPLE_LOGIN_SUCCESS, APPLE_LOGIN_FAIL } from '../actions/types';

export default function (state = {}, action) {
	switch (action.type) {
		case FACEBOOK_LOGIN_SUCCESS:
			return { token: action.payload };
		case FACEBOOK_LOGIN_FAIL:
			return { token: null };
		case GOOGLE_LOGIN_SUCCESS:
			return { token: action.payload };
		case GOOGLE_LOGIN_FAIL:
			return { token: null };
		case APPLE_LOGIN_SUCCESS:
			return { token: action.payload };
		case APPLE_LOGIN_FAIL:
			return { token: null };
		default:
			return state;
	}
}
