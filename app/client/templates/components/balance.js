/**
Template Controllers

@module Templates
*/

/**
The balance template

@class [template] components_balance
@constructor
*/

Template['components_balance'].helpers({
    /**
    Get The Original Balance

    @method (watchBalance)
    */

    'watchBalance': function(){        
		return Session.get('balance');
    },
});

_.extend(Template['components_balance'], {	
	/**
    On Template Created

    @method (created)
    */

	'created': function() {
		this.updateBalance = Meteor.setInterval(function() {
			var sum = new BigNumber(0);
			for (var acc in web3.eth.accounts) {
				var balance = web3.eth.getBalance(web3.eth.accounts[acc]);
				sum = sum.plus(balance);
			}

			Session.set("balance", sum.toString());
		}, 1 * 1000);
	},

	/**
    On Template Destroyed

    @method (destroyed)
    */

	'destroyed': function() {
		Meteor.clearInterval(this.updateBalance);
	}
});
