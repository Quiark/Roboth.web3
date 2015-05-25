/**
Template Controllers

@module Templates
*/

/**
The accounts template

@class [template] components_accounts
@constructor
*/

var template_this = Template['components_accounts'];

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

	Session.set('selected_account', 2);
});

template_this.events({
	'click .acc_row': function(event, tpl) {
		var num = Number.parseInt( $(event.currentTarget).data('accNum') );

		Session.set('selected_account', num);
	}

});

Template['components_accounts'].helpers({


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
