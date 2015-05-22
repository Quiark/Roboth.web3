var template_this = Template['components_createDictJob'];


template_this.events({
	'click #bSubmit': function(event, tpl) {
		window.RoEthCls.instance();

		// send the transaction, on the client
		var wrd = tpl.$('#word').val();

		var WORD_REWARD = web3.toWei(0.1);

		Roboth.createDictionaryJob.sendTransaction(wrd, {from: Helpers.selectedAcc(), value: WORD_REWARD, gas: 400 * 1000});

		// trigger update
		RoEthCls.MyJobId.refresh(RoEthCls.BLOCK_TIME);
		RoEthCls.instance().UpdateDictJobs();
	},

	'click #bCheck': function(event, tpl) {
		console.log(Roboth.jobid().toString());

	}
});

template_this.helpers({
});
