var template_this = Template['components_createDictJob'];


template_this.events({
	'click #bSubmit': function(event, tpl) {
		window.RoEthCls.instance();

		// send the transaction, on the client
		var wrd = tpl.$('#word').val();

		var WORD_REWARD = web3.toWei(0.01);

		Roboth.createJob.sendTransaction(wrd, {from: Helpers.selectedAcc(), value: WORD_REWARD, gas: 400 * 1000});

		// trigger update
		//RoEthCls.MyJobId.refresh(RoEthCls.BLOCK_TIME);
		RoEthCls.instance().UpdateUserData(RoEthCls.BLOCK_TIME);
	},

	'click #bCheck': function(event, tpl) {
		console.log(Roboth.m_next_userid().toString());
	}
});

template_this.helpers({
	'Roboth_live': function() {
		if (Roboth == null) return false;
		if (!web3) return false;
		return web3.eth.getCode(Roboth.address) != '0x';
	},

	'sel_acc': function() {
		return Helpers.selectedAcc();
	}
});
