import { SEARCHED_WORD } from '../actions/types';

const initialState = {
    Searched_Word: ''
  };


export default function (state = initialState, action) {
  switch (action.type) {
    case SEARCHED_WORD:
      return {
      	...state,
      	Searched_Word: action.Searched_Word,
      	};
    default:
      return state;
  }
}

