/**
Template Controllers

@module Templates
*/

/**
The accounts template

@class [template] components_accounts
@constructor
*/

Meteor.startup(function () {
	// Insert accounts into collection.
	var accounts = web3.eth.accounts;
	Accounts.remove({}); // Removal hack.
	if(_.isArray(accounts)) {
		var count = 0;
		_.each(accounts, function(address){
			count += 1;
			Accounts.insert({number: count, address: address, balance: web3.eth.getBalance(address).toString(10), createdAt: new Date()});
		});
	}
});

Template['components_accounts'].helpers({
	/**
    Convert Wei to Ether Values

    @method (toEth)
    */

	'toEth': function(wei){
		return web3.fromWei(wei, LocalStore.get('etherUnit')).toString(10);
	},

	/**
    Get Eth Accounts

    @method (accounts)
    */

	'accounts': function(){
		return Accounts.find({}).map(function(el) {
			el['selected'] = (Session.get('selected_account') == el['number']);
			return el;
		});
	}
});
