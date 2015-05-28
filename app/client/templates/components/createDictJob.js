var template_this = Template['components_createDictJob'];


template_this.events({
	'click #bSubmit': function(event, tpl) {
		window.RoEthCls.instance();

		// send the transaction, on the client
		var wrd = tpl.$('#iWord');
		var reward = tpl.$('#iReward');

		Roboth.createJob.sendTransaction(wrd.val(), {from: Helpers.selectedAcc(), value: web3.toWei(reward.val()), gas: 400 * 1000});

		// trigger update
		// TODO: bind visual feedback with the update
		//Helpers.startSubmitting(tpl.$('input'));

		RoEthCls.instance().userdata_mgr.setDirty();
	},

	'click #bCheck': function(event, tpl) {
		console.log(Roboth.m_next_userid().toString());
	}
});

template_this.helpers({
	'Roboth_live': function() {
		if (window.Roboth == null) return false;
		if (!web3) return false;
		return web3.eth.getCode(Roboth.address) != '0x';
	},

	'sel_acc': function() {
		return Helpers.selectedAcc();
	}
});
