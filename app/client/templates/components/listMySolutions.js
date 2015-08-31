var template_this = Template['components_listMySolutions'];

template_this.helpers({
	'solutions': function() {
		return RoInst().userdata_mgr.mysol_react_var.get();
	}
});

template_this.events({
	'click .sol_check_payout': function(event, tpl) {
		var $btn = $(event.currentTarget);
		var sol_id = $btn.data('solId');
		var job_user = $btn.data('jobUser');
		if (RoEthCls.instance().Roboth.checkPayout.call(job_user, sol_id)) {
			Flash.success("payout", 'The solution has payout!', 5000);
			// highlight to indicate we got payback
			RoEthCls.instance().Roboth.checkPayout.sendTransaction(job_user, sol_id, {from: Helper.selectedAcc(), gas: 110*1000});
		}
	}
});
