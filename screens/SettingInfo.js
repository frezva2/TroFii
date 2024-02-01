import { types, destroy } from 'mobx-state-tree';
import { observable } from 'mobx';

const Info = types.optional(types.frozen, {
      email: types.string,
      firstname: types.string,
      lastname: types.string, 
      image: types.string, 
      username: types.string,
      tokenPass: types.string,
      restName: types.string,
      restHours: types.string,
      egiftEarned: types.number,
	  isRestActive: types.boolean,
	  isRecommended: types.boolean,
	  points: types.number,
	  expoToken: types.string,
	  yourLocation: types.string,
	  restMaxPercentage: types.number,
	  aroundRadius: types.number,
	  phoneNum: types.string,
	  redeemedPoints: types.number,
	  followerNum: types.number,
	  code: types.number,
	  userTotalRate: types.number,
	  tempHours: types.number,
	  Drink: types.number,
	  Appetizer: types.number,
	  restAddress: types.string,
	  restWebsite: types.string,
	  restOrderWeb: types.string,
	  Entrée: types.number,
	  Dessert: types.number,
	  boolToken: types.boolean,
	  eGiftChoiceDate: types.number,
	  egiftChoice: types.string,
	  Notifications: types.frozen,
	  createdAt: types.number,
	  iseGiftRequested: types.boolean,
	  followersList: types.frozen,
	  followingList: types.frozen,
	  restsList: types.frozen,
	  restFollowingNum: types.number,
});

const infomation = types.model('infomation', {
	info: types.optional(types.frozen, Info)
})
.views(self => ({
	get infoChecker() {
		return self.info;
	}
}))
.actions(self => ({
 InfoPusher(values) {
		self.info.push(values);
	},
 deleteInfo(data) {
 	destroy(data);
 }
}))
.create({
	@observable info: []
});

export default infomation;
