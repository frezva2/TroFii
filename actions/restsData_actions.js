import {
SEARCHED_WORD
} from './types';

export const updateSearchingWord = (name) => {
	// console.log(name);
	return {
		type: SEARCHED_WORD,
		Searched_Word: name 
	};
};
